import { prisma } from "../index";

//Dado un id de sala devuelve todos los mensajes de dicha sala
export const getMensajesSala = async (idSala: string): Promise<any> => {
    return await prisma.mensaje.findMany({
        where: { idsala: parseInt(idSala) },
    });
}

//Dado un id de usuario, un id de sala, un texto y su archivo multimedia 
//correspondiente ( si lo hay) crea un mensaje en la sala
export const createMensaje = async (idUsuario: string, idSala: string, texto: string, multimedia: string): Promise<any> => {
    const fecha = new Date();
    return await prisma.mensaje.create({
        data: {
          idusuario: parseInt(idUsuario),
          idsala: parseInt(idSala),
          fechahora: fecha,
          texto: texto,
          rutamultimedia: multimedia,
        },
      });
}