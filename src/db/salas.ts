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

//Devuelve el numero de salas que no estan sincronizadas
export const getSalasNoSincronizadas = async (): Promise<any> => {
    return await prisma.participa.count({
        where: { estado: "no_sincronizada" },
    });
}

//Devuelve el numero de salas que estan sincronizadas
export const getSalasSincronizadas = async (): Promise<any> => {
    return await prisma.participa.count({
        where: { estado: "sincronizada" },
    });
}

//Devuelve el numero de usuarios que no han hecho match actualmente
export const getSalasUnitariasCount = async (): Promise<any> => {
    return await prisma.videoviewer.count();
}

//Devuelve el numero de salas que hay en la base de datos
export const getTotalSalas = async (): Promise<any> => {
    return await prisma.sala.count();
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

//Dado un id de usuario devuelve una lista con la informacion de las salas en las que participa
export const getAllSalasUsuario = async (idUsuario: string): Promise<any> => {
    const idUsuario_int = parseInt(idUsuario);
    return await prisma.participa.findMany({
        where: { idusuario: idUsuario_int }
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
// Dado el id de un usuario y el id de un video, borra la sala unitaria de forma atomica si existe
// Devuelve true si se borró al menos un registro, false en caso contrario
export const deleteSalaUnitariaAtomic = async (idUsuario: string, idVideo: string): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);
  try {
    const deleteResult = await prisma.$transaction([
      prisma.videoviewer.deleteMany({
        where: {
          AND: [
            { idvideo: idVideo },
            { idusuario: idUsuario_int }
          ]
        }
      })
    ]);
    console.log('Resultado de la eliminacion:', deleteResult);
    
    // Si el conteo de registros eliminados es mayor que cero, significa que se borró al menos un registro
    const borrado = deleteResult[0].count > 0;

    // Devuelve true si y solo si se borró al menos un registro
    return borrado;

  } catch (error) {
    // Manejar error aquí
    console.error('Error borrando sala unitaria de forma atomica:', error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}

