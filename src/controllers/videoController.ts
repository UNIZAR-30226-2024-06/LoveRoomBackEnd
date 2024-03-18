import { prisma } from "../index";
import { Request, Response } from "express";

const VideoController = {
  videosInteres: async (req: Request, res: Response): Promise<any> => {
    try {
      const { idUsuario } = req.params;
      const idUsuario_int = parseInt(idUsuario);

      // Obtenemos los datos del usuario necesarios para la logica de la consulta
      const userData = await prisma.usuario.findUnique({
        where: {
          id: idUsuario_int,
        },
        select: {
          idlocalidad: true,
          sexo: true,
          buscasexo: true,
          buscaedadmin: true,
          buscaedadmax: true,
          edad: true,
        },
      });

      console.log(userData);

      // Buscamos los videos que estan viendo las personas de interes de ese usuario
      const videosInteres = await prisma.videoviewer.groupBy({
        by: ["idvideo"],
        _count: {
          idvideo: true,
        },
        where: {
          usuario: {
            id: { not: idUsuario_int }, // chequeamos que el usuario no sea él mismo
            idlocalidad: userData?.idlocalidad, // que esten en la misma localidad
            sexo: userData?.buscasexo === "T" ? undefined : userData?.buscasexo, // que tenga el sexo que busca el usuario
            // que busque el sexo del usuario o todos los sexos
            OR: [
              {
                buscasexo: userData?.sexo,
              },
              {
                buscasexo: "T",
              },
            ],
            edad: {
              // que este en el rango de edad que busca el usuario
              gte: userData?.buscaedadmin,
              lte: userData?.buscaedadmax,
            },
            buscaedadmin: {
              // que busque el rango de edad del usuario
              lte: userData?.edad,
            },
            buscaedadmax: {
              gte: userData?.edad,
            },
          },
        },
        orderBy: {
          _count: {
            idvideo: "desc",
          },
        },
      });

      // Procesamos la respuesta para formatearla como una lista de: {idvideo, viewers}
      const formattedResponse = videosInteres.map((video) => {
        return {
          idvideo: video.idvideo,
          viewers: video._count.idvideo,
        };
      });

      // Enviamos la respuesta con los videos de interes junto con la cantidad de usuarios viendolos
      res.json(formattedResponse);
    } catch (error) {
      console.error("Error retrieving videos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default VideoController;
