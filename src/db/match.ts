import { prisma } from "../index";

//Dado dos ids de usuario guarda que han realizado un match
export const createMatch = async (idUsuario1: string, idUsuario2: string): Promise<any> => {
    return await prisma.match.create({
        data: {
          idusuario1: parseInt(idUsuario1),
          idusuario2: parseInt(idUsuario2),
        },
      });
}

//Dado un id de usuario devuelve una lista con los matches que ha realizado
export const getMatchesUsuario = async (idUsuario: string): Promise<any> => {
    return await prisma.match.findMany({
        where: { idusuario1: parseInt(idUsuario) },
    });
}