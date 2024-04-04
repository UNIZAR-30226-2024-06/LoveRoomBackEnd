import { prisma } from "../index";

//Dado dos IDs de usuario guarda que han realizado un match
export const createMatch = async (idUsuario1: string, idUsuario2: string): Promise<any> => {
  return await prisma.match.create({
    data: {
      idusuario1: parseInt(idUsuario1),
      idusuario2: parseInt(idUsuario2),
    },
  });
};

//Dado un ID de usuario devuelve una lista con los IDs de usuarios que hayan hecho match previamente con el usuario
export const getMatchesUsuario = async (idUsuario: string): Promise<any> => {
  const idUsuario_int = parseInt(idUsuario);
  return await prisma.usuario.findMany({
    select: {
      id: true,
    },
    distinct: ["id"],
    where: {
      OR: [
        {
          match_match_idusuario1Tousuario: {
            some: { idusuario2: idUsuario_int },
          },
        },
        {
          match_match_idusuario2Tousuario: {
            some: { idusuario1: idUsuario_int },
          },
        },
      ],
    },
  });
};
