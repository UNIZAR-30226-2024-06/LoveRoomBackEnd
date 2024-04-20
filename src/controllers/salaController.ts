import {createSalaUnitaria, 
        createSala,
        deleteSala, 
        getParticipantesSala, 
        getAllSalasUsuario,
        getEstadoSala,
        setEstadoSala,
        deleteSalaUnitariaAtomic } from '../db/salas';
import { createMatch } from '../db/match';
import { getUsuariosViendoVideo } from '../db/video';
import { Request, Response } from "express";
import SocketManager from '../services/socketManager';
import usuarios from '../db/usuarios';


const SalaController = {
  
   verVideo: async(req: Request, res: Response): Promise<any> => {
    try {
      const { idVideo } = req.params;
      const idUsuario = req.body.idUser;

      // Obtenemos los usuarios de interes que estan viendo el video
      // console.log("Obteniendo usuarios viendo video")
      const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo, idUsuario);
      console.log("Usuarios viendo video:", usuariosViendoVideo);
      
      // Si hay al menos un usuario de interes viendo ese video
      if (usuariosViendoVideo.length > 0) {
        let i = 0;
        //Comprobamos de la lista de usuarios que no se haya hecho match con el 
        while( ( i < usuariosViendoVideo.length ) && 
              !(await deleteSalaUnitariaAtomic(usuariosViendoVideo[i].idusuario.toString(), idVideo))){
          i++;
        }

        //Todos los match que habia disponibles ya no lo estan 
        if ( i >= usuariosViendoVideo.length){
            //Creamos una sala unitaria 
            console.log("Todos los match posibles han sido agotados");
            const salaUnitaria = await createSalaUnitaria(idUsuario, idVideo);
            

            const formattedResponse = {
              id: salaUnitaria.id,
              idvideo: salaUnitaria.idvideo,
              idusuario: salaUnitaria.idusuario,
              esSalaUnitaria: true,
            }
            return res.json(formattedResponse);
        } else {
          const usuarioMatch = usuariosViendoVideo[i].idusuario.toString();
          // Creamos una sala con los dos usuarios
          const nuevaSala = await createSala(idUsuario, usuarioMatch, idVideo);

          //Creamos un match entre los dos usuarios
          await createMatch(idUsuario, usuarioMatch);
          //Creamos el match inverso
          await createMatch(usuarioMatch, idUsuario);

          //Emitimos el match
          console.log("Emitiendo match a usuario", usuarioMatch);
          await SocketManager.getInstance().emitMatch(idUsuario.toString(), usuarioMatch,nuevaSala.idvideo);

          const formattedResponse = {
            id: nuevaSala.id,
            idvideo: nuevaSala.idvideo,
            idusuario: usuarioMatch,
            esSalaUnitaria: false,
          }
          
          return res.json(formattedResponse);
        }
        
      } else {
        //Creamos una sala unitaria 
        console.log("No hay nadie viendo el video, creando sala unitaria");
        const salaUnitaria = await createSalaUnitaria(idUsuario, idVideo);

        const formattedResponse = {
          id: salaUnitaria.id,
          idvideo: salaUnitaria.idvideo,
          idusuario: salaUnitaria.idusuario,
          esSalaUnitaria: true,
        }
        return res.json(formattedResponse);
      }
    } catch (error) {
      console.error("Error al manejar salas:", error);
      return res.status(500).json({ error: "Error al manejar salas" });
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

  getAllSalasUsuario: async (req: Request, res: Response): Promise<any> => {
    try {
      const idUsuario = req.body.idUser;
      const salas = await getAllSalasUsuario(idUsuario);
      if(salas.length == 0){
        return res.json([]);
      }
      const formattedResponse = salas.map((sala: any) => {
        return {
          id: sala.idsala,
          idvideo: sala.idvideo,
          estado: sala.estado,
        };
      });
      return res.json(formattedResponse);
    } catch (error) {
      console.error("Error al obtener salas de usuario:", error);
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
      const { idVideo} = req.params;
      const idUsuario = req.body.idUser;
      await deleteSalaUnitariaAtomic(idUsuario, idVideo);
      return res.status(200).json({ message: "Sala unitaria eliminada" });
    } catch (error) {
      console.error("Error al eliminar sala unitaria:", error);
      return res.status(500).json({ error: "Error al eliminar sala unitaria" });
    }
  }
}

export default SalaController;
