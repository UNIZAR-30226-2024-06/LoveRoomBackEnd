import { prisma } from "../index";
import { Request, Response } from "express";

const VideoController = {
    videosInteres: async (req: Request, res: Response): Promise<any> => {
        try {
            const { idUsuario } = req.params;

            const videos = await prisma.videoviewer.findMany({
                where: {
                    idusuario: parseInt(idUsuario)
                }
            });
            res.json(videos);
        } catch (error) {
            console.error("Error retrieving videos:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

export default VideoController;
