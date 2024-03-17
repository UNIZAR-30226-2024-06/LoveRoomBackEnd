import SocketManager from '../controllers/socketManager';
import {Server} from 'socket.io';
import { prisma } from '../index';
import { parse } from 'path';


class SalaController {

  private static socketManager: SocketManager;

  public static initializeSocketManager(io: Server): void {

    if (!SalaController.socketManager) {
      SalaController.socketManager = SocketManager.getInstance(io);
    }
  }
  
  public static async verVideo(idVideo: string, idUsuario: string): Promise<string> {
    try {
      const usuariosViendoVideo = await prisma.videoviewer.findMany({
        where: { urlvideo: idVideo },
      });

      if (usuariosViendoVideo.length > 0) {
        const nuevaSala = await prisma.sala.create({
          data: {
            urlvideo: idVideo,
          },
          
        });
        
        await prisma.participa.create({
          data: {
            idsala: nuevaSala.id,
            idusuario: parseInt(idUsuario),
            estado: 'Activo',
          },
        });

        await prisma.participa.create({
          data: {
            idsala: nuevaSala.id,
            idusuario: usuariosViendoVideo[0].idusuario,
            estado: 'Activo',
          },
        
        })

        this.socketManager.emitMatchBigRoom(idUsuario, nuevaSala.id, nuevaSala.urlvideo);
        return `/sala/${nuevaSala.id}`;
      } else {
        const salaUnitaria = await prisma.videoviewer.create({
          data: {
            urlvideo: idVideo,
            idusuario: parseInt(idUsuario),
          },
        });

        return `/sala/${salaUnitaria.urlvideo}`;
      }
    } catch (error) {
      console.error('Error al manejar salas:', error);
      throw new Error('Error al manejar salas');
    }
  }

  public static async borrarSalaUnitaria(urlvideo: string, idUsuario: string): Promise<void> {
    try {
      await prisma.videoviewer.delete({
      where: {
        urlvideo_idusuario: {
        urlvideo: urlvideo,
        idusuario: parseInt(idUsuario),
        }
      },
      });
      console.log("Sala unitaria borrada de usuario #{idUsuario}");
    } catch (error) {
      console.error('Error al borrar sala unitaria:', error);
      throw new Error('Error al borrar sala unitaria');
    }
  }
}

  
export { SalaController };