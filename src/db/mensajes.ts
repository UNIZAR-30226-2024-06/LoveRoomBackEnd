import { prisma } from "../index";
import { getAllSalasUsuario } from "./salas";

//Dado un id de sala devuelve todos los mensajes de dicha sala solo si el usuario pertenece a la sala
export const getMensajesSala = async (idUsuario: string, idSala: string): Promise<any> => {
  try {
    const idSala_Int = parseInt(idSala);
    // Comprobamos que el usuario pertenezca a la sala
    const idsSalasUsuario = await getAllSalasUsuario(idUsuario);
    let salaEncontrada = false;
    for (let i = 0; i < idsSalasUsuario.length; i++) {
      if (idsSalasUsuario[i].idsala === idSala_Int) {
        salaEncontrada = true;
        break;
      }
    }
    if (!salaEncontrada) {  // Si el usuario no pertenece a la sala, lanzamos un error
      console.error('El usuario no pertenece a la sala indicada');
      throw new Error('El usuario no pertenece a la sala indicada');
    } else {  // Si el usuario pertenece a la sala, devolvemos los mensajes
      return await prisma.mensaje.findMany({
        where: {
          idsala: idSala_Int,
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener los mensajes de la sala:', error);
    throw error;
  }
}

//Dado un id de usuario, un id de sala, un texto y su archivo multimedia 
//correspondiente ( si lo hay) crea un mensaje en la sala
export const createMensaje = async (idUsuario: string, idSala: string, texto: string, multimedia: string, fecha: Date): Promise<any> => {
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

// Dado un id de mensaje y un motivo crea un report con la información del mensaje
export const reportMessage = async (idMensaje: string, motivo_: string, idUsuario: string): Promise<any> => {
  const idMensaje_Int = parseInt(idMensaje);
  try {
    const mensaje = await prisma.mensaje.findUnique({
      where: {
        id: idMensaje_Int,
      }
    });
    if (!mensaje) {
      console.error('No se ha encontrado el mensaje');
      throw new Error('No se ha encontrado el mensaje');
    }

    // Comprobamos que el mensaje a reportar este en una de las salas del usuario
    const salasUsuario = await getAllSalasUsuario(idUsuario);
    let mensajeEnSala = false;
    for (let i = 0; i < salasUsuario.length; i++) {
      if (salasUsuario[i].idsala === mensaje.idsala) {
        mensajeEnSala = true;
        break;
      }
    }
    
    if (!mensajeEnSala) {
      console.error('El mensaje no pertenece a ninguna sala del usuario');
      throw new Error('El mensaje no pertenece a ninguna sala del usuario');
    }
    else {  // Si el mensaje pertenece a una sala del usuario, creamos el reporte
      const nuevoReport = await prisma.reporte.create({
        data: {
          idmensaje: idMensaje_Int,
          idusuario: mensaje.idusuario,
          texto: mensaje.texto,
          rutamultimedia: mensaje.rutamultimedia,
          motivo: motivo_,
          resuelto: false,
        }
      });
      return nuevoReport;
    }
  } catch (error) {
    console.error('Error al reportar el mensaje:', error);
    throw error;
  }
}

// Devuelve todos los reportes de mensajes
export const getAllReportsDB = async (showResolved: boolean): Promise<any> => {
  try {
    if (showResolved) {
      const reports = await prisma.reporte.findMany();
      return reports;
    } else {
      const reports = await prisma.reporte.findMany({
        where: {
          resuelto: false
        }
      });
      return reports;
    }
  } catch (error) {
    console.error('Error al obtener los reportes:', error);
    throw error;
  }
}

// Devuelve el reporte con id
export const getReportById = async (idReport: string): Promise<any> => {
  const idReport_Int = parseInt(idReport);
  try {
    const report = await prisma.reporte.findUnique({
      where: {
        id: idReport_Int,
      },
    });
    return report;
  } catch (error) {
    console.error('Error al obtener el reporte:', error);
    throw error;
  }
}

export const resolveReport = async (idReport: string, banUser: boolean): Promise<any> => {
  const idReport_Int = parseInt(idReport);
  try {
    // Buscamos el reporte por su ID y actualizamos el campo 'resuelto' a true
    const reporte = await prisma.reporte.update({
      where: { id: idReport_Int },
      data: { resuelto: true }
    });
    // Si se ha marcado banUser como true, baneamos al usuario que ha creado el mensaje reportado
    if (banUser && reporte.idusuario) {
      await prisma.usuario.update({
        where: { id: reporte.idusuario },
        data: { baneado: true }
      });
    }
  } catch (error) {
    console.error('Error al resolver el reporte:', error);
    throw error;
  }
}

export const deleteReport = async (idReport: string): Promise<any> => {
  const idReport_Int = parseInt(idReport);
  try {
    // Buscamos el reporte por su ID y lo eliminamos
    await prisma.reporte.delete({
      where: { id: idReport_Int }
    });
  } catch (error) {
    console.error('Error al eliminar el reporte:', error);
    throw error;
  }
}
//Devuelve el numero de reportes que han sido resueltos
export const getResolvedReports = async (): Promise<any> => {
  return await prisma.reporte.count({
    where: { resuelto: true }
  });
}

//Devuelve el numero de reportes que no han sido resueltos
export const getUnresolvedReports = async (): Promise<any> => {
  return await prisma.reporte.count({
    where: { resuelto: false }
  });
}