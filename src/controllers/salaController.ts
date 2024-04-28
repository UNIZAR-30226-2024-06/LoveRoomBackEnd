import {createSalaUnitaria, 
        createSala,
        deleteSala, 
        getParticipantesSala, 
        getInfoSalasUsuario,
        getEstadoSala,
        setEstadoSala,
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
      // console.log("Obteniendo usuarios viendo video")
      const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo, idUsuario);
      console.log("Usuarios viendo video:", usuariosViendoVideo);
      
      // Si hay al menos un usuario de interes viendo ese video
      if (usuariosViendoVideo.length > 0) {
        let i = 0;
        //Comprobamos de la lista de usuarios que no se haya hecho match con el 
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
            await SocketManager.getInstance().emitMatch(idUsuario.toString(), usuarioMatch, nuevaSala.idvideo);

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
      const formattedResponse = usuarios.map((usuario: any) => {
          return {
            id: usuario.idusuario,
            estado: usuario.estado,
          };
        });
      return res.json(formattedResponse);
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
      if(estado !== "sincronizada" || estado !== "no sincronizada"){
        res.status(400).json({ error: "Estado de sala no válido" });
        return;
      }
      await setEstadoSala(idSala, idUsuario, estado);
      return res.status(200).json({ message: "Estado de sala actualizado" });
    } catch (error) {
      console.error("Error al actualizar estado de sala:", error);
      return res.status(500).json({ error: "Error al actualizar estado de sala" });
    }

  },

  getSalaSincronizada: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idSala, idUsuario } = req.params;
      const estado = await getEstadoSala(idSala,idUsuario);
      return res.json({estado: estado});
    } catch (error) {
      console.error("Error al obtener estado de sala:", error);
      return res.status(500).json({ error: "Error al obtener estado de sala" });
    }

  },

  deleteSala: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idSala } = req.params;
      await deleteSala(idSala);
      return res.status(200).json({ message: "Sala eliminada" });
    } catch (error) {
      console.error("Error al eliminar sala:", error);
      return res.status(500).json({ error: "Error al eliminar sala" });
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
