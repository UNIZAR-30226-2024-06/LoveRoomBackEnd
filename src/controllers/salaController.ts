import {createSalaUnitaria, 
        createSala,
        deleteSala, 
        getParticipantesSala, 
        getAllSalasUsuario,
        getEstadoSala,
        setEstadoSala} from '../db/salas';
import { createMatch } from '../db/match';
import { getUsuariosViendoVideo } from '../db/video';
import { Request, Response } from "express";
import SocketManager from '../services/socketManager';

const SalaController = {
  
   verVideo: async(req: Request, res: Response): Promise<any> => {
    try {
      const { idVideo } = req.params;
      const idUsuario = req.body.idUser;

      // Obtenemos los usuarios de interes que estan viendo el video
      // console.log("Obteniendo usuarios viendo video")
      const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo, idUsuario);
      
      // Si hay al menos un usuario de interes viendo ese video
      if (usuariosViendoVideo.length > 0) {
        console.log("Usuarios viendo video:", usuariosViendoVideo);

        // Creamos una sala con los dos usuarios
        const nuevaSala = await createSala(idUsuario, usuariosViendoVideo[0].idusuario.toString(), idVideo);
        
        //Creamos un match entre los dos usuarios
        await createMatch(idUsuario, usuariosViendoVideo[0].idusuario.toString());

        //Emitimos el match
        console.log("Emitiendo match a usuario", usuariosViendoVideo[0].idusuario.toString());
        await SocketManager.getInstance().emitMatch(idUsuario.toString(), usuariosViendoVideo[0].idusuario.toString(),nuevaSala.idvideo);

        const formattedResponse = {
          id: nuevaSala.id,
          idvideo: nuevaSala.idvideo,
          esSalaUnitaria: false,
        }
        
        return res.json(formattedResponse);
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
  }

}

export default SalaController;
