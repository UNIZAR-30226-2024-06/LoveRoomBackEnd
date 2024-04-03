import { prisma } from "../index";

//Dados los ids de un video y de un usuario devuelve una lista con los usuarios de interes para el usuario que estan viendo ese video
export const getUsuariosViendoVideo = async (idVideo: string, idUsuario: string): Promise<any> => {
    return await prisma.videoviewer.findMany({
        where: { idvideo: idVideo },
    });
}
