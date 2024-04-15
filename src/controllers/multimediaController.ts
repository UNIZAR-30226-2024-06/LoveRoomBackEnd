import { Request, Response } from "express"
import { uploadsDirectory } from "../storage"
import { multimediaTypes } from "../constants/multimediaTypes"
import { createMultimedia, deleteMultimedia} from "../db/multimedia"




const MultimediaController = {


    uploadFoto: async (req: Request, res: Response): Promise<any> => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const fileName = req.file.filename;
        const ruta = uploadsDirectory + fileName;
        const nombreArchivo = await createMultimedia(ruta, multimediaTypes.IMAGE);
        console.log(ruta);
        return res.json({ nombreArchivo: fileName });
    },

    uploadVideo: async (req: Request, res: Response): Promise<any> => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const fileName = req.file.filename;
        const ruta = uploadsDirectory + fileName;
        const nombreArchivo = await createMultimedia(ruta, multimediaTypes.VIDEO);
        console.log(ruta);
        return res.json({ nombreArchivo: fileName });
    },

    deleteMultimedia: async (req: Request, res: Response): Promise<any> => {
        const { nombreArchivo } = req.params;
        const rutaMultimedia = uploadsDirectory + '/' + nombreArchivo;
        const result = await deleteMultimedia(rutaMultimedia);
    },

    getMultimedia: async (req: Request, res: Response): Promise<any> => {
        const { nombreArchivo } = req.params;
        const rutaMultimedia = uploadsDirectory + '/' + nombreArchivo;
        return res.sendFile(rutaMultimedia);
    }

}

export default MultimediaController;