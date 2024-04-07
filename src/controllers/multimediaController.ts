import { Request, Response } from "express"
import { uploadsDirectory } from "../storage"
import { multimediaTypes } from "../constants/multimediaTypes"
import { createMultimedia, deleteMultimedia} from "../db/multimedia"
import fs from 'fs';



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
        const { nombreArchivo, idUsuario} = req.params;
        const rutaMultimedia = uploadsDirectory + '/' + nombreArchivo;
        
        fs.access(rutaMultimedia, fs.constants.F_OK, async (err) => {
            if (err) {
                // El archivo no existe
                console.error('El archivo no existe:', err);
                return res.status(404).json({ error: 'El archivo no existe' });
            }
            
            // El archivo existe, borrarlo
            const result = await deleteMultimedia(rutaMultimedia);
            if(result){
                fs.unlink(rutaMultimedia, (err) => {
                    if (err) {
                        console.error('Error al borrar el archivo:', err);
                        return res.status(400).json({ error: 'Error al eliminar multimedia' });
                        
                    }
                    console.log('El archivo ha sido borrado correctamente');
                    return res.status(200).json({ mensaje: 'Multimedia eliminada correctamente'});
                });
            }else {
                return res.status(400).json({ error: 'Error al eliminar multimedia' });
            }
        });
    },

    getMultimedia: async (req: Request, res: Response): Promise<any> => {
        const { nombreArchivo } = req.params;
        const idUsuario = req.body.idUser;
        const rutaMultimedia = uploadsDirectory + '/' + nombreArchivo;
        fs.access(rutaMultimedia, fs.constants.F_OK, (err) => {
            if (err) {
                // El archivo no existe
                console.error('El archivo no existe:', err);
                return res.status(404).json({ error: 'El archivo no existe' });
            }
            
            // El archivo existe, enviarlo
            return res.sendFile(rutaMultimedia);
        });
    }

}

export default MultimediaController;
