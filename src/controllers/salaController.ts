import { Server, Socket } from 'socket.io';
import { prisma } from '../index';


class SalaController {
  static sincronizarUsuarios(arg0: string, sincronizarUsuarios: any) {
    throw new Error('Method not implemented.');
  }
    io: Server;
  static io: any;
  
    constructor(io: Server) {
      this.io = io;
  
      this.io.on('connection', (socket: Socket) => {
        console.log(`Usuario conectado: ${socket.id}`);
  
        socket.on('disconnect', () => {
          console.log(`Usuario desconectado: ${socket.id}`);
        });
  
        socket.on('joinSala', (sala) => {
          // El usuario se une a la sala específica
          socket.join(sala);
        });
      });
    }
  
    public static async verVideo(idVideo: string, correoUsuario: string): Promise<string> {
      try {
        const usuariosViendoVideo = await prisma.videoyoutube.findMany({
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
              sala: nuevaSala.idsala,
              usuario: correoUsuario,
              estado: 'Activo',
            },
          });
  
          // El usuario se une a la sala específica
          this.io.to(correoUsuario).emit('joinSala', nuevaSala.idsala);
  
          return `/sala/${nuevaSala.idsala}`;
        } else {
          const salaUnitaria = await prisma.videoyoutube.create({
            data: {
              urlvideo: idVideo,
              idusuario: correoUsuario,
            },
          });
  
          // El usuario se une a la sala específica
          this.io.to(correoUsuario).emit('joinSala', salaUnitaria.urlvideo);
  
          return `/sala/${salaUnitaria.urlvideo}`;
        }
      } catch (error) {
        console.error('Error al manejar salas:', error);
        throw new Error('Error al manejar salas');
      }
    }
  }

  
export { SalaController };