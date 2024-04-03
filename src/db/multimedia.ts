import { prisma } from "../index";

//Dada la ruta de un video, asi como su tipo guarda un registro suyo en la base de datos, devolviendo la ruta del archivo
export const createMultimedia = async (ruta: string, tipo: string): Promise<any> => {
    const multimedia = await prisma.multimedia.create({
                                data: {
                                ruta: ruta,
                                tipomultimedia: tipo,
                                },
                            });
    return multimedia.ruta;
}

//Dado un archivo multimedia previamente guardado en la base de datos y el id de un mensaje lo asocia con el mensaje
export const addMultimediaToMensaje = async (idMensaje: string, ruta: string): Promise<any> => {
    return await prisma.mensaje.update({
        where: { id: parseInt(idMensaje) },
        data: {
            rutamultimedia: ruta,
        },
    });
}

//Dado un id de usuario y una ruta de un archivo multimedia guarado previamente en la base de datos y lo asocia con el usuario
export const addMultimediaToUsuario = async (idUsuario: string, ruta: string): Promise<any> => {
    const fotoUsuario = await prisma.fotousuario.findFirst({
        where: { idusuario: parseInt(idUsuario) },
    });
    //Si devuelve algo significa que ya habia una foto de usuario 
    //anterior por lo que solamente hay que actualizarla
    if(fotoUsuario){
         return await prisma.fotousuario.update({
            where: { rutafoto_idusuario: {
                        idusuario: fotoUsuario.idusuario,
                        rutafoto: fotoUsuario.rutafoto
                    },
                },
            data: {
                rutafoto: ruta,
            },
        });
    }else{
        return await prisma.fotousuario.create({
            data: {
                idusuario: parseInt(idUsuario),
                rutafoto: ruta,
            }});
    }

}

//Dado un id de usuario devuelve su foto de perfil
export const getFotoUsuario = async (idUsuario: string): Promise<any> => {
    return await prisma.fotousuario.findFirst({
        where: { idusuario: parseInt(idUsuario) },
    });
}

//Dado un id de mensaje devuelve su archivo multimedia asociado
export const getMultimediaMensaje = async (idMensaje: string): Promise<any> => {
    return await prisma.mensaje.findFirst({
        where: { id: parseInt(idMensaje) },
    });
}

//Dada una ruta de un archivo multimedia la borra de la base de datos
export const deleteMultimedia = async (ruta: string): Promise<any> => {
    return await prisma.multimedia.delete({
        where: { ruta: ruta },
    });
}

//Dada una ruta de un archivo multimedia devuelve el tipo de archivo
export const getTipoMultimedia = async (ruta: string): Promise<any> => {
    const multimedia = await prisma.multimedia.findFirst({
        where: { ruta: ruta },
    });
    return multimedia?.tipomultimedia;
}