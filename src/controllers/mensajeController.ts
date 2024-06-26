import { Request, Response } from "express";
import { createMensaje, getMensajesSala, reportMessage, getAllReportsDB, getReportById, resolveReport, deleteReport } from "../db/mensajes";
import { addMultimediaToMensaje,getMultimediaMensaje } from "../db/multimedia";
import { resolve } from "path";
import { uploadsDirectory } from "../storage"


const MensajeController = {

    getMensajesSala: async (req: Request, res: Response): Promise<any> => {
        try {
            const idUsuario = req.body.idUser;  // Cogemos el id del checkAuthUser
            const { idSala } = req.params;
            const mensajes = await getMensajesSala(idUsuario, idSala);
            return res.json(mensajes);
        } catch (error: any) {
            if (error.message && error.message === 'El usuario no pertenece a la sala indicada') {
                return res.status(403).json({ error: "El usuario no pertenece a la sala indicada" });
            } else {
                console.error("Error al obtener mensajes de sala:", error);
                return res.status(500).json({ error: "Error al obtener mensajes de sala" });
            }
        }
    },

    getMultimediaAttachedToMensaje: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idMensaje } = req.params;
            const multimedia = await getMultimediaMensaje(idMensaje);
            return res.sendFile(multimedia.ruta);
        } catch (error) {
            console.error("Error al obtener multimedia de mensaje:", error);
            return res.status(500).json({ error: "Error al obtener multimedia de mensaje" });
        }
    },
    
    createMensaje: async (req: Request, res: Response): Promise<any> => {
        try {
            const idSala = req.params.idSala;
            const idUsuario = req.body.idUsuario;
            const multimedia = req.body.multimedia;
            const texto = req.body.texto;
            if(!texto.trim()){
                console.error("El mensaje no puede estar vacío");
                return res.status(400).send("El mensaje no puede estar vacío" );
            }

            const fechaHora = new Date();
            // Adjust the date manually to Madrid timezone (UTC+2)
            fechaHora.setHours(fechaHora.getHours() + 2);

            const mensaje = await createMensaje(idUsuario, idSala, texto, multimedia, fechaHora);
            const formattedResponse = {
                fechaHora: mensaje.fechahora,
                idUsuario: mensaje.idusuario,
                texto: mensaje.texto,
                multimedia: mensaje.rutamultimedia,
            };
            return res.json(formattedResponse);
        } catch (error) {
            console.error("Error al crear mensaje:", error);
            return res.status(500).json({ error: "Error al crear mensaje" });
        }
    },

    reportMessage: async (req: Request, res: Response): Promise<any> => {
        try {
            const idUsuario = req.body.idUser;
            const { idMensaje } = req.params;
            const { motivo } = req.body;
            const reporte = await reportMessage(idMensaje, motivo, idUsuario);
            return res.json(reporte);
        } catch (error) {
            return res.status(500).json({ error: "Error al reportar mensaje" });
        }
    },

    getAllReports: async (req: Request, res: Response): Promise<any> => {
        try {
            let { showResolved } = req.body;
            if (showResolved === undefined) {
                showResolved = false;
            }
            const reportes = await getAllReportsDB(showResolved);
            return res.json(reportes);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener reportes" });
        }
    },

    getReportById: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idReport } = req.params;
            const report = await getReportById(idReport);
            return res.json(report);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener reporte" });
        }
    },

    resolveReport: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idReport } = req.params;
            let { banUser } = req.body;
            if (banUser === undefined) {
                banUser = false;
            }
            await resolveReport(idReport, banUser);
            return res.json({ message: "Reporte resuelto correctamente" });
        } catch (error) {
            return res.status(500).json({ error: "Error al resolver reporte" });
        }
    },

    deleteReport: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idReport } = req.params;
            await deleteReport(idReport);
            return res.json({ message: "Reporte eliminado correctamente" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar reporte" });
        }
    }

}

export default MensajeController;
