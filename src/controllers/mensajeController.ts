import { Request, Response } from "express";
import { createMensaje, getMensajesSala } from "../db/mensajes";
import { addMultimediaToMensaje,getMultimediaMensaje } from "../db/multimedia";


const MensajeController = {

    getMensajesSala: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idSala } = req.params;
            const mensajes = await getMensajesSala(idSala);
            const formattedResponse = mensajes.map((mensaje: any) => {
                return {
                    fechaHora: mensaje.fechahora,
                    idUsuario: mensaje.idusuario,
                    texto: mensaje.texto,
                    multimedia: mensaje.rutamultimedia,
                };
            });
            return res.json(formattedResponse);
        } catch (error) {
            console.error("Error al obtener mensajes de sala:", error);
            return res.status(500).json({ error: "Error al obtener mensajes de sala" });
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
            const { idUsuario, texto} = req.body;
            const multimedia = req.body.multimedia;
            if(!texto.trim()){
                console.error("El mensaje no puede estar vacío");
                return res.status(400).send("El mensaje no puede estar vacío" );
            }
            const mensaje = await createMensaje(idUsuario, idSala, texto, multimedia);
            await addMultimediaToMensaje(mensaje.idmensaje, multimedia);
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

    reportMensaje: async (req: Request, res: Response): Promise<any> => {

    }

}

export default MensajeController;