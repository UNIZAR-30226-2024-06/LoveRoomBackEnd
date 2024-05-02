import { prisma } from "../index";
import { getAllSalasUsuario } from "./salas";

//Dado un id de sala devuelve todos los mensajes de dicha sala
export const getMensajesSala = async (idSala: string): Promise<any> => {
    return await prisma.mensaje.findMany({
        where: { idsala: parseInt(idSala) },
    });
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
export const getAllReportsDB = async (): Promise<any> => {
  try {
    const reports = await prisma.reporte.findMany();
    return reports;
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

export const resolveReport = async (idReport: string): Promise<any> => {
  const idReport_Int = parseInt(idReport);
  try {
    // Buscamos el reporte por su ID y actualizamos el campo 'resuelto' a true
    await prisma.reporte.update({
      where: { id: idReport_Int },
      data: { resuelto: true }
    });
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