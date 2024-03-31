import {createSalaUnitaria, createSala,deleteSalaUnitaria} from '../db/salas';
import { getUsuariosViendoVideo } from '../db/video';
import SocketManager from '../services/socketManager';


class SalaController {
  
  public static async verVideo(
    idVideo: string,
    idUsuario: string
  ): Promise<string> {
    try {
      console.log("Obteniendo usuarios viendo video")
      const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo);
      
      //Si hay al menos un usuario viendo ese video
      if (usuariosViendoVideo.length > 0) {
        console.log("Usuarios viendo video:", usuariosViendoVideo);
        //Creamos una sala con los dos usuarios
        const nuevaSala = await createSala(idUsuario, usuariosViendoVideo[0].idusuario.toString(), idVideo);
        
        //Emitimos el match
        console.log("Emitiendo match a usuario", usuariosViendoVideo[0].idusuario.toString());
        SocketManager.getInstance().emitMatch(idUsuario.toString(), usuariosViendoVideo[0].idusuario.toString(),nuevaSala.idvideo);
        
        return `/sala/${nuevaSala.id}`;
      } else {
        //Creamos una sala unitaria 
        console.log("No hay nadie viendo el video, creando sala unitaria");
        const salaUnitaria = await createSalaUnitaria(idUsuario, idVideo);

        return `/sala/${salaUnitaria.idvideo}`;
      }
    } catch (error) {
      console.error("Error al manejar salas:", error);
      throw new Error("Error al manejar salas");
    }
  }

}

export { SalaController };
