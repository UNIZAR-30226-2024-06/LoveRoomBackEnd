import SocketManager from '../controllers/socketManager';
import {Server} from 'socket.io';
import { prisma } from '../index';


class SalaController {

  private static socketManager: SocketManager;

  public static initializeSocketManager(io: Server): void {

    if (!SalaController.socketManager) {
      SalaController.socketManager = SocketManager.getInstance(io);
    }
  }
  
  public static async verVideo(idVideo: string, correoUsuario: string): Promise<string> {
    try {
      const usuariosViendoVideo = await prisma.videoyoutube.findMany({
        where: { urlvideo: idVideo },
      });

      if (usuariosViendoVideo.length > 0) {
        const nuevaSala  = await prisma.sala.create({
          data: {
            urlvideo: idVideo,
          },
          
        });
        
        await prisma.participa.create({
          data: {
            sala: nuevaSala.idsala,
            usuario: correoUsuario,
            estado: 'Activo',
          },
        });

        await prisma.participa.create({
          data: {
            sala: nuevaSala.idsala,
            usuario: usuariosViendoVideo[0].idusuario,
            estado: 'Activo',
          },
        
        })

        this.socketManager.emitMatchBigRoom(correoUsuario, nuevaSala.idsala,nuevaSala.urlvideo);
        return `/sala/${nuevaSala.idsala}`;
      } else {
        const salaUnitaria = await prisma.videoyoutube.create({
          data: {
            urlvideo: idVideo,
            idusuario: correoUsuario,
          },
        });

        return `/sala/${salaUnitaria.urlvideo}`;
      }
    } catch (error) {
      console.error('Error al manejar salas:', error);
      throw new Error('Error al manejar salas');
    }
  }

  public static async borrarSalaUnitaria(urlvideo: string, correoUsuario: string): Promise<void> {
    try {
      await prisma.videoyoutube.delete({
      where: {
        urlvideo_idusuario: {
        urlvideo: urlvideo,
        idusuario: correoUsuario
        }
      },
      });
      console.log("Sala unitaria borrada de usuario #{correoUsuario}");
    } catch (error) {
      console.error('Error al borrar sala unitaria:', error);
      throw new Error('Error al borrar sala unitaria');
    }
  }
}

  
export { SalaController };