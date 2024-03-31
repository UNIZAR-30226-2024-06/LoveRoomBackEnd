import { prisma } from "../index";

//Dados dos ids de usuario crea una sala, devuelviendo su id 
export const createSala = async (idUsuario1: string, idUsuario2: string, idVideo: string): Promise<any> => {
    const nuevaSala = await prisma.sala.create({
        data: {
          idvideo: idVideo,
        },
      });
    
    //Creamos las dos relaciones de participa
    await prisma.participa.create({
        data: {
          idsala: nuevaSala.id,
          idusuario: parseInt(idUsuario1),
          estado: "Activo",
        },
    });

    await prisma.participa.create({
        data: {
          idsala: nuevaSala.id,
          idusuario: parseInt(idUsuario2),
          estado: "Activo",
        },
    });

    return nuevaSala.id;
}

//Dado el id de una sala la borra y todas sus relaciones
export const deleteSala = async (idSala: string): Promise<any> => {

    await prisma.participa.deleteMany({
        where: {
          idsala: parseInt(idSala),
        },
    });

    await prisma.sala.delete({
        where: {
          id: parseInt(idSala),
        },
    });
}

//Dado un usuario crea una sala unitaria
export const createSalaUnitaria = async (idUsuario: string, idVideo: string): Promise<any> => {
    return await prisma.videoviewer.create({
        data: {
          idvideo: idVideo,
          idusuario: parseInt(idUsuario),
        },
      });
}

//Borra una sala unitaria
export const deleteSalaUnitaria = async (idUsuario: string, idVideo: string): Promise<any> => {
    await prisma.videoviewer.delete({
        where: {
          idvideo_idusuario: {
            idvideo: idVideo,
            idusuario: parseInt(idUsuario),
          },
        },
      });
}