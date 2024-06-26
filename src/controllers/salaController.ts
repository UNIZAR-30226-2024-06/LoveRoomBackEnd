import {createSalaUnitaria, 
        createSala,
        deleteSala, 
        getParticipantesSala, 
        getInfoSalasUsuario,
        getEstadoSala,
        setEstadoSala,
        changeNombreSala,
        deleteSalaUnitariaAtomic,
        sobrepasaLimiteSalas } from '../db/salas';
import { createMatch } from '../db/match';
import { getUsuariosViendoVideo } from '../db/video';
import { Request, Response } from "express";
import SocketManager from '../services/socketManager';


const SalaController = {
  
   verVideo: async(req: Request, res: Response): Promise<any> => {
    try {
      const { idVideo } = req.params; // Cogemos el id del video de la URL
      const idUsuario = req.body.idUser;  // Cogemos el id del checkAuthUser

      // Borramos las posibles entradas previas de videoViewer para ese usuario
      await deleteSalaUnitariaAtomic(idUsuario);

      // Comprobamos que el usuario no haya sobrepasado su limite de salas
      if (await sobrepasaLimiteSalas(idUsuario)) {
        return res.status(403).json({ error: "El usuario ha sobrepasado su limite de salas" });
      }

      // Obtenemos los usuarios de interes que estan viendo el video
      const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo, idUsuario);
      console.log("Usuarios viendo video:", usuariosViendoVideo);
      
      // Si hay al menos un usuario de interes viendo ese video
      if (usuariosViendoVideo.length > 0) {
        let i = 0;
        // Intentamos hacer match con el borrando su sala unitaria
        while( ( i < usuariosViendoVideo.length ) && 
              !(await deleteSalaUnitariaAtomic(usuariosViendoVideo[i].idusuario.toString()))){
          i++;
        }

        // Si todos los match que habia disponibles ya no lo estan 
        if ( i >= usuariosViendoVideo.length){
            // Creamos una sala unitaria 
            console.log("Todos los match posibles han sido agotados");
            await createSalaUnitaria(idUsuario, idVideo);
            
            const formattedResponse = {
              esSalaUnitaria: true
            }
            return res.json(formattedResponse);
        } else {  // Hay match
          const usuarioMatch = usuariosViendoVideo[i].idusuario.toString();
          // Creamos una sala con los dos usuarios
          const nuevaSala = await createSala(idUsuario, usuarioMatch, idVideo);

          // Creamos el match entre los dos usuarios
          await createMatch(idUsuario, usuarioMatch);
          
          const formattedResponse = {
            idsala: nuevaSala.id,
            idusuario: Number(usuarioMatch),
            esSalaUnitaria: false,
          }

          try {
            // Emitimos el match
            console.log("Emitiendo match a usuario", usuarioMatch);
            SocketManager.getInstance().emitMatch(idUsuario, usuarioMatch, nuevaSala.id.toString(), idVideo);

            return res.json(formattedResponse);
          } catch (error) {
            console.error("Error al emitir match:", error);

            // Aunque falle la emision del match, no se borra la sala creada,
            // y el usuario al que no le ha llegado el match podra acceder a ella
            // desde su lista de salas
            return res.json(formattedResponse);
          }
        }  
      } else {  // No hay usuarios de interes viendo el video
        //Creamos una sala unitaria 
        console.log("No hay nadie viendo el video, creando sala unitaria");
        await createSalaUnitaria(idUsuario, idVideo);

        const formattedResponse = {
          esSalaUnitaria: true
        }
        return res.json(formattedResponse);
      }
    } catch (error) {
      console.error("Error al ver video:", error);
      return res.status(500).json({ error: "Error al ver video" });
    }
  },

  getParticipantesSala: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idSala } = req.params;
      const usuarios = await getParticipantesSala(idSala);
      return res.json(usuarios);
    } catch(error){
      console.error("Error al obtener participantes de la sala:", error);
      return res.status(500).json({ error: "Error al obtener participantes de la sala" });
    }
  },

  // Devuelve para cada sala de un usuario: idsala, estado, idvideo, idusuariomatch
  getInfoSalasUsuario: async (req: Request, res: Response): Promise<any> => {
    try {
      const idUsuario = req.body.idUser;
      const infoSalas = await getInfoSalasUsuario(idUsuario);
      return res.json(infoSalas);
    } catch (error) {
      console.error("Error al obtener salas de usuario: ", error);
      return res.status(500).json({ error: "Error al obtener salas de usuario" });
    }
  },

  setEstadoSala: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idSala, idUsuario, estado } = req.body;
      if(estado !== "sincronizada" || estado !== "no_sincronizada"){
        res.status(400).json({ error: "Estado de sala no válido" });
        return;
      }
      await setEstadoSala(idSala, estado);
      return res.status(200).json({ message: "Estado de sala actualizado" });
    } catch (error) {
      console.error("Error al actualizar estado de sala:", error);
      return res.status(500).json({ error: "Error al actualizar estado de sala" });
    }

  },

  setNombreSala: async (req: Request, res: Response): Promise<any> => {
    try {
      const idUsuario = req.body.idUser;
      const { idSala } = req.params;
      const { nombreSala } = req.body;
      await changeNombreSala(idUsuario, idSala, nombreSala);
      return res.status(200).json({ message: "Nombre de sala actualizado" });
    } catch (error: any) {
      if (error.message && error.message === 'El usuario no pertenece a la sala indicada') {
        return res.status(403).json({ error: "El usuario no pertenece a la sala indicada" });
      } else {
        console.error("Error al cambiar nombre de sala:", error);
        return res.status(500).json({ error: "Error al cambiar nombre de sala" });
      }
    }
  },

  getSalaSincronizada: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idSala } = req.params;
      const estado = await getEstadoSala(idSala);
      return res.json({estado: estado});
    } catch (error) {
      console.error("Error al obtener estado de sala:", error);
      return res.status(500).json({ error: "Error al obtener estado de sala" });
    }

  },

  deleteSala: async (req: Request, res: Response): Promise<any> => {
    try {
      const idUsuario = req.body.idUser;
      const { idSala } = req.params;
      // Obtenemos los participantes de la sala
      const participantes = await getParticipantesSala(idSala);
      // Borramos la sala si el usuario pertenece a ella
      const borrada = await deleteSala(idUsuario, idSala);
      console.log("Sala eliminada: ", borrada);
      // Emitimos un evento UNMATCH a los participantes de la sala para que si estaban dentro se salgan
      participantes.forEach(async (participante: any) => {
        if (participante.idusuario.toString() !== idUsuario) {
          console.log("Emitiendo unmatch a usuario", participante.idusuario.toString());
          SocketManager.getInstance().emitUnmatch(participante.idusuario.toString(), idSala);
        }
      });
      return res.status(200).json({ message: "Sala eliminada correctamente" });
    } catch (error: any) {
      if (error.message && error.message === 'El usuario no pertenece a la sala indicada') {
        return res.status(403).json({ error: "El usuario no pertenece a la sala indicada" });
      } else {
        console.error("Error al eliminar sala:", error);
        return res.status(500).json({ error: "Error al eliminar sala" });
      }
    }
  },

  deleteSalaUnitaria: async (req: Request, res: Response): Promise<any> => {
    try {
      const idUsuario = req.body.idUser;
      if (await deleteSalaUnitariaAtomic(idUsuario)) {
        return res.status(200).json({ message: "Sala unitaria eliminada" });
      } else {
        return res.status(404).json({ error: "El usuario no estaba viendo ningun video" });
      }
    } catch (error) {
      console.error("Error al eliminar sala unitaria:", error);
      return res.status(500).json({ error: "Error al eliminar sala unitaria" });
    }
  }
}

export default SalaController;
