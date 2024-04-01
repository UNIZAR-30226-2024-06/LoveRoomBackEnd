import { prisma } from "../index";


//Dado un id de una sala y un usuario modifica su estado a no_sincronizada o sincronizada
export const setEstadoSala = async (idUsuario: string, idSala: string, estado: string): Promise<any> => {
    await prisma.participa.update({
         where: {
             idsala_idusuario: {
                 idusuario: parseInt(idUsuario),
                 idsala: parseInt(idSala),
             }
         },
        data: {
          estado:estado,
        },
    });
}

//Dado un id de sala devuelve una lista con los participantes de dicha sala
export const getParticipantesSala = async (idSala: string): Promise<any> => {
    const participantes = await prisma.participa.findMany({
        where: { idsala: parseInt(idSala) },
    });
    if(participantes.length == 2){
        return participantes;
    }
}

//Dado un id de usuario y una sala devuelve el estado de dicha sala
export const getEstadoSala = async (idUsuario: string, idSala: string): Promise<any> => {
    const participante = await prisma.participa.findFirst({
        where: { idusuario: parseInt(idUsuario), idsala: parseInt(idSala) },
    });
    if(participante){
        return participante.estado;
    }else {
        return null;
    }
}

//Dado un id de usuario devuelve una lista con las salas en las que participa
export const getAllSalasUsuario = async (idUsuario: string): Promise<any> => {
    return await prisma.participa.findMany({
        where: { idusuario: parseInt(idUsuario) },
    });
}
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
          estado: "sincronizada",
        },
    });

    await prisma.participa.create({
        data: {
          idsala: nuevaSala.id,
          idusuario: parseInt(idUsuario2),
          estado: "sincronizada",
        },
    });

    return nuevaSala;
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