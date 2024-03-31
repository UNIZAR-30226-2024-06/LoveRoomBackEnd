import { prisma } from "../index";

//Dado un id de un video devuelve el una lista con los usuarios que estan viendo ese video
export const getUsuariosViendoVideo = async (idVideo: string): Promise<any> => {
    return await prisma.videoviewer.findMany({
        where: { idvideo: idVideo },
    });
}