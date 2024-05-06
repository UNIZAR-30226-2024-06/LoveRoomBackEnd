import { prisma } from "../index";
import { getUsuariosViendoVideo } from '../db/video';
import { createMatch } from '../db/match';
import SocketManager from '../services/socketManager';

//Dado un id de una sala modifica su estado a no_sincronizada o sincronizada
export const setEstadoSala = async (idSala: string, estado: string): Promise<any> => {
    const idSala_int = parseInt(idSala);
    await prisma.sala.update({
        where: { id: idSala_int },
        data: { estado: estado },
    });
}

//Dado un id de sala y un id de video cambia el video de la sala
export const changeVideoSala = async (idSala: string, idVideo: string): Promise<any> => {
  const idSala_int = parseInt(idSala);
  await prisma.sala.update({
      where: { id: idSala_int },
      data: { idvideo: idVideo },
  });
}

//Devuelve el numero de salas que no estan sincronizadas
export const getSalasNoSincronizadas = async (): Promise<any> => {
    return await prisma.sala.count({
        where: { estado: "no_sincronizada" },
    });
}

//Devuelve el numero de salas que estan sincronizadas
export const getSalasSincronizadas = async (): Promise<any> => {
    return await prisma.sala.count({
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
        select: { idusuario: true },
        where: { idsala: parseInt(idSala) },
    });
    console.log(participantes);
    if(participantes.length == 2){
        return participantes;
    }
    else {
        return null;
    }
}

// Dado un id de una sala devuelve su estado
export const getEstadoSala = async (idSala: string): Promise<any> => {
    const idSala_int = parseInt(idSala);
    const sala = await prisma.sala.findUnique({
        where: { id: idSala_int },
    });
    if (!sala) {
        console.error('Sala no encontrada');
        throw new Error('Sala no encontrada');
    }
    return sala.estado;
}

// Dado un id de usuario devuelve una lista con todos los ids de las salas en las que participa
export const getAllSalasUsuario = async (idUsuario: string): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);
  try {
    // Obtenemos todos los ids de las salas del usuario
    const salasUsuario = await prisma.participa.findMany({
      select: {
        idsala: true
      },
      where: { idusuario: idUsuario_int }
    });
    return salasUsuario;
  } catch (error) {
    console.error('Error al obtener salas de usuario:', error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}

// Dado un id de usuario devuelve una lista con la informacion de las salas en las que participa
// Devuelve para cada sala: idsala, estado, idvideo, idusuariomatch
export const getInfoSalasUsuario = async (idUsuario: string): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);
  try {
    // Obtenemos todos los ids de las salas del usuario
    const salas = await prisma.participa.findMany({
      select: {
        idsala: true
      },
      where: { idusuario: idUsuario_int }
    });
    // Obtenemos la informacion a devolver de cada sala
    const infosalas = await prisma.sala.findMany({
      where: {
        id: {
          in: salas.map((room: { idsala: number }) => room.idsala) // Explicitly annotate type for 'room'
        }
      },
      select: {
        id: true,
        nombre: true,
        idvideo: true,
        estado: true,
        participa: {
          select: {
            idusuario: true
          },
          where: {
            NOT: {
              idusuario: idUsuario_int // Excluir al usuario actual
            }
          }
        }
      }
    });

    // Formatear el resultado
    const result = infosalas.map((sala: { id: number, nombre: string, idvideo: string, estado: string, participa: { idusuario: number }[] }) => {
      return {
        idsala: sala.id,
        nombre: sala.nombre,
        idvideo: sala.idvideo,
        estado: sala.estado, // asumimos que solo hay un participante adicional
        idusuariomatch: sala.participa[0].idusuario // asumimos que solo hay un participante adicional
      };
    });

    return result;
  } catch (error) {
    throw new Error(`Error al obtener las salas del usuario: ${error}`);
  }
}

// Dada una sala, devuelve toda su informacion
export const getInfoSala = async (idSala: string): Promise<any> => {
  const idSala_int = parseInt(idSala);
  return await prisma.sala.findUnique({
    where: { id: idSala_int }
  });
}

// Actualiza la informacion de sincronizacion de una sala
export const updateSincroSala = async (idSala: string, idVideo: string, tiempoSegundos: number, estado: string): Promise<any> => {
  const idSala_int = parseInt(idSala);
  return await prisma.sala.update({
    where: { id: idSala_int },
    data: {
      idvideo: idVideo,
      tiemposegundos: tiempoSegundos,
      estado: estado
    }
  });
}

// Dado un id de usuario comprueba si ese usuario ha sobrepasado su limite de salas (3 para usuarios normales),
// (infinitas para usuarios premium). Devuelve true si ha sobrepasado el limite, false en caso contrario
export const sobrepasaLimiteSalas = async (idUsuario: string): Promise<any> => {
  try {
    const idUsuario_int = parseInt(idUsuario);
    const usuario = await prisma.usuario.findUnique({
      where: { id: idUsuario_int }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Si el usuario es premium o administrador, no tiene limite de salas
    if (usuario.tipousuario === 'premium' || usuario.tipousuario === 'administrador') {
      return false;
    }

    // Si el usuario es normal, comprobamos si tiene 3 o mas salas
    const salasUsuario = await getNumSalasUsuario(idUsuario);
    return salasUsuario >= 3; // Devuelve true si tiene 3 o mas salas, false en caso contrario

  } catch (error) {
    console.error('Error al comprobar limite de salas:', error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}

export const getNumSalasUsuario = async (idUsuario: string): Promise<any> => {
  try {
    const idUsuario_int = parseInt(idUsuario);
    const salasUsuario = await prisma.participa.count({
      where: { idusuario: idUsuario_int }
    });
    return salasUsuario;
  } catch (error) {
    console.error('Error al obtener numero de salas de usuario:', error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}


//Dados dos ids de usuario crea una sala, devuelviendo su id 
export const createSala = async (idUsuario1: string, idUsuario2: string, idVideo: string): Promise<any> => {
    const nuevaSala = await prisma.sala.create({
        data: {
          nombre: "Sala de " + idUsuario1 + " y " + idUsuario2,
          idvideo: idVideo,
          estado: "sincronizada",
          tiemposegundos: 0,
        },
      });
    
    //Creamos las dos relaciones de participa
    await prisma.participa.create({
        data: {
          idsala: nuevaSala.id,
          idusuario: parseInt(idUsuario1),
        },
    });

    await prisma.participa.create({
        data: {
          idsala: nuevaSala.id,
          idusuario: parseInt(idUsuario2),
        },
    });

    return nuevaSala;
}

//Dado el id de una sala y el id de un usuario, borra la sala si y solo si el usuario es participante
export const deleteSala = async (idUsuario: string, idSala: string): Promise<any> => {
  try {
    const idSala_int = parseInt(idSala);
    const idUsuario_int = parseInt(idUsuario);
    return await prisma.sala.delete({
      where: {
        id: idSala_int,
        participa: {
          some: {
            idusuario: idUsuario_int
          }
        }
      }
    });
  } catch (error: any) {
    if (error.code && error.code === 'P2025') { // Verificar si el error es debido a que la sala no existe
      console.error('Error: El usuario no pertenece a la sala indicada');
      throw new Error('El usuario no pertenece a la sala indicada');
    } else {
      console.error('Error al borrar sala:', error);
      throw error; // Re-lanzar error para manejo en el nivel superior
    }
  }
}

// Dado el id de un usuario, borra todas sus salas
export const deleteAllSalasUsuario = async (idUsuario: string): Promise<any> => {
  try {
    const idUsuario_int = parseInt(idUsuario);
    return await prisma.sala.deleteMany({
      where: {
        participa: {
          some: {
            idusuario: idUsuario_int
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al borrar salas de usuario:', error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}

//Dado un usuario crea una sala unitaria (en realidad es solo una entrada en la tabla videoviewer)
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
// Dado el id de un usuario borra todas las entradas de la tabla videoViewer que correspondan 
// a ese usuario de forma atomica (si existen).
// Devuelve True si se borró al menos un registro, False en caso contrario
export const deleteSalaUnitariaAtomic = async (idUsuario: string): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);
  try {
    const deleteResult = await prisma.$transaction([
      prisma.videoviewer.deleteMany({
        where: {
          idusuario: idUsuario_int
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

export const cambiarVideoUnitaria = async (idUsuario: string, idVideo: string): Promise<any> => {
  try {
    // Borramos las posibles entradas previas de videoViewer para ese usuario
    await deleteSalaUnitariaAtomic(idUsuario);

    // Comprobamos que el usuario no haya sobrepasado su limite de salas
    if (await sobrepasaLimiteSalas(idUsuario)) {
      throw new Error('El usuario ha sobrepasado su limite de salas');
    }

    // Obtenemos los usuarios de interes que estan viendo el video
    const usuariosViendoVideo = await getUsuariosViendoVideo(idVideo, idUsuario);
    console.log("Usuarios viendo video:", usuariosViendoVideo);
    
    // Si hay al menos un usuario de interes viendo ese video
    if (usuariosViendoVideo.length > 0) {
      let i = 0;
      // Intentamos hacer match con el borrando su sala unitaria
      while( ( i < usuariosViendoVideo.length ) && 
            !(await deleteSalaUnitariaAtomic(usuariosViendoVideo[i].idusuario.toString()))){
        i++;
      }

      // Si todos los match que habia disponibles ya no lo estan 
      if ( i >= usuariosViendoVideo.length){
          // Creamos una sala unitaria 
          console.log("Todos los match posibles han sido agotados");
          await createSalaUnitaria(idUsuario, idVideo);
          
          const formattedResponse = {
            esSalaUnitaria: true
          }
          return formattedResponse;
      } else {  // Hay match
        const usuarioMatch = usuariosViendoVideo[i].idusuario.toString();
        // Creamos una sala con los dos usuarios
        const nuevaSala = await createSala(idUsuario, usuarioMatch, idVideo);

        // Creamos el match entre los dos usuarios
        await createMatch(idUsuario, usuarioMatch);
        
        const formattedResponse = {
          idsala: nuevaSala.id,
          idusuario: Number(usuarioMatch),
          esSalaUnitaria: false,
        }

        try {
          // Emitimos el match
          console.log("Emitiendo match a usuario", usuarioMatch);
          SocketManager.getInstance().emitMatch(idUsuario, usuarioMatch, nuevaSala.id.toString(), idVideo);

          return formattedResponse;
        } catch (error) {
          console.error("Error al emitir match:", error);

          // Aunque falle la emision del match, no se borra la sala creada,
          // y el usuario al que no le ha llegado el match podra acceder a ella
          // desde su lista de salas
          return formattedResponse;
        }
      }  
    } else {  // No hay usuarios de interes viendo el video
      //Creamos una sala unitaria 
      console.log("No hay nadie viendo el video, creando sala unitaria");
      await createSalaUnitaria(idUsuario, idVideo);

      const formattedResponse = {
        esSalaUnitaria: true
      }
      return formattedResponse;
    }
  } catch (error) {
    console.error("Error al ver video:", error);
    throw error; // Re-lanzar error para manejo en el nivel superior
  }
}
