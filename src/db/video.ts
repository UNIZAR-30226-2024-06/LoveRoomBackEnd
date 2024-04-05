import { prisma } from "../index";
import { getUserById } from "../db/usuarios";
import { getMatchesUsuario } from "./match";

// Dados el ID de un video y de un usuario devuelve una lista con los ids de los
// usuarios de interes para el usuario que estan viendo ese video
export const getUsuariosViendoVideo = async (
  idVideo: string,
  idUsuario: string
): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);

  // Obtenemos los datos del usuario necesarios para la logica de la consulta
  const userData = await getUserById(idUsuario_int);

  // Obtenemos los IDs de usuarios que hayan hecho match previamente con el usuario
  const matchesPrevios = await getMatchesUsuario(idUsuario);

  // Mapeamos los IDs de los usuarios para realizar la comparacion
  const matchesPreviosIds = matchesPrevios.map((user: any) => user.id);

  // Buscamos los IDs de los usuarios de interes que estan viendo el video
  const usuariosInteres = await prisma.videoviewer.findMany({
    select: {
      idusuario: true,
    },
    distinct: ["idusuario"], // Obtener usuarios únicos
    where: {
      idvideo: idVideo,
      usuario: {
        id: {
          not: idUsuario_int, // chequeamos que el usuario no sea él mismo
          notIn: matchesPreviosIds, // chequeamos que no hayan hecho match previamente
        },
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
  });
  //console.log("Usuarios de interes:", usuariosInteres);

  return usuariosInteres;
};
