import { Request, Response } from "express";
import { uploadsDirectory } from "../storage";
import { multimediaTypes } from "../constants/multimediaTypes";
import {
  createMultimedia,
  deleteMultimedia,
  getTipoMultimedia,
} from "../db/multimedia";

const MultimediaController = {
  uploadFoto: async (req: Request, res: Response): Promise<any> => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const fileName = req.file.filename;
    const nombreArchivo = await createMultimedia(
      fileName,
      multimediaTypes.IMAGE
    );
    console.log("Ruta foto " + uploadsDirectory + "/" + fileName);
    return res.json({ nombreArchivo: fileName });
  },

  uploadVideo: async (req: Request, res: Response): Promise<any> => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const fileName = req.file.filename;
    const nombreArchivo = await createMultimedia(
      fileName,
      multimediaTypes.VIDEO
    );
    console.log("Ruta video " + uploadsDirectory + "/" + fileName);
    return res.json({ nombreArchivo: fileName });
  },

  deleteMultimedia: async (req: Request, res: Response): Promise<any> => {
    const { nombreArchivo } = req.params;
    const result = await deleteMultimedia(nombreArchivo);
    console.log(
      "Ruta multimedia eliminado: " + uploadsDirectory + "/" + nombreArchivo
    );
  },

  getMultimedia: async (req: Request, res: Response): Promise<any> => {
    const { nombreArchivo } = req.params;
    const rutaMultimedia = uploadsDirectory + "/" + nombreArchivo;
    console.log("Ruta multimedia solicitado: " + rutaMultimedia);

    const tipoMultimedia = await getTipoMultimedia(nombreArchivo);
    var resOptions = { headers: { TipoMultimedia: "U" } }; // Undefined
    if (tipoMultimedia) {
      console.log("Tipo de multimedia: " + tipoMultimedia);
      // res.setHeader("TipoMultimedia", tipoMultimedia);
      resOptions = { headers: { TipoMultimedia: tipoMultimedia } };
    }
    console.log("resOptions: ", resOptions);
    return res.sendFile(rutaMultimedia, resOptions);
  },
};

export default MultimediaController;
