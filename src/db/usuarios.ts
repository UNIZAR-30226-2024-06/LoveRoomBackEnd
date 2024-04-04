import { prisma } from '../index';


export const createUser = async (name: string, email: string, pass: string) =>{
    const nuevoUSuario = await prisma.usuario.create({
        data: {
            correo: name,
            nombre: email,
            contrasena: pass,
            tipousuario: 'normal',
            sexo: 'O',
            edad: 18,
            buscaedadmin: 18,
            buscaedadmax: 75,
            buscasexo: 'T',
            descripcion: 'nulo',
            baneado: false,
            fotoperfil: 'null.jpg',
            idlocalidad: 0,
        },
    });
    return nuevoUSuario;
}

export const updateUser = async (id: number, info: string) => {
    const user = JSON.parse(info);
    const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          correo: user.correo,
          nombre: user.nombre,
          contrasena: user.contrasena,
          edad: user.edad,
          sexo: user.sexo,
          buscaedadmin: user.buscaedadmin,
          buscaedadmax: user.buscaedadmax,
          buscasexo: user.buscasexo,
          descripcion: user.descripcion,
          fotoperfil: user.fotoperfil,
          idlocalidad: user.idlocalidad,
          tipousuario: user.tipousuario,
          baneado: user.baneado,
        },
    });
}

export const updateEmail = async (id: number, email: string) => {
    const user = await prisma.usuario.update({
        where: {
            id: id,
        },
        data: {
            correo: email,
        },
    });
    return user;
}

export const updateName = async (id: number, name: string) => {
    console.log(id, name);
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          nombre: name,
        },
    });
    return user;
}

export const updateAge = async (id: number, age: number) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          edad: age,
        },
    });
    return user;
}

export const updateSex = async (id: number, sex: string) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          sexo: sex,
        },
    });
    return user;
}

export const updateDescription = async (id: number, description: string) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          descripcion: description,
        },
    });
    return user
}

export const updatePhoto = async (id: number, photo: string) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          fotoperfil: photo,
        },
    });
    return user;
}

export const updateLocation = async (id: number, location: number) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          idlocalidad: location,
        },
    });
    return user;
}

export const updatePassword = async (id: number, password: string) => {
    const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          contrasena: password,
        },
    });
    return usuario;
}

export const updatePreferences = async (id: number, preferences: string) => {
    const info = JSON.parse(preferences);
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          buscaedadmin: info.buscaedadmin,
          buscaedadmax: info.buscaedadmax,
          buscasexo: info.buscasexo,
        },
    });
    return user;
}
export const updateType = async (id: number, type: string) => {
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          tipousuario: type,
        },
    });
    return user;
}
export const banUser = async (id: number) => {
    console.log(id);
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          baneado: true,
        },
    });
    return user;
}

export const unbanUser = async (id: number) => {
    console.log(id);
    const user = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          baneado: false,
        },
    });
    return user;
}

export const getUserByEmail = async (email: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: {
          correo: email,
        },
        select: {
            id: true,
            correo: true,
            nombre: true,
            contrasena: true,
            edad: true,
            sexo: true,
            buscaedadmin: true,
            buscaedadmax: true,
            buscasexo: true,
            descripcion: true,
            fotoperfil: true,
            idlocalidad: true,
            tipousuario: true,
            baneado: true,
        }
    });
    return usuario;
}

export const deleteUser = async (id: number) => {
    const user = await prisma.usuario.delete({
        where: {
          id: id,
        },
    });
    return user;
}
    
export const getUserById = async (id: number) => {
    const usuario = await prisma.usuario.findUnique({
        where: {
          id: id,
        },
        select: {
            id: true,
            correo: true,
            nombre: true,
            contrasena: true,
            edad: true,
            sexo: true,
            buscaedadmin: true,
            buscaedadmax: true,
            buscasexo: true,
            descripcion: true,
            fotoperfil: true,
            idlocalidad: true,
            tipousuario: true,
            baneado: true,
        }
    });
    return usuario;
}

export const getUsers = async () => {
    const users = await prisma.usuario.findMany({
        select: {
            id: true,
            correo: true,
            nombre: true,
            contrasena: true,
            edad: true,
            sexo: true,
            buscaedadmin: true,
            buscaedadmax: true,
            buscasexo: true,
            descripcion: true,
            fotoperfil: true,
            idlocalidad: true,
            tipousuario: true,
            baneado: true,
        }
    });
    return users;
}

export const getTipoUsuario = async (id: number) => {
    const user =  await prisma.usuario.findUnique({
      where: {
        id: id,
      }
    });
    if(user){
      return user.tipousuario;
    }
}


export default{
    createUser,
    updateEmail,
    updateName,
    updateAge,
    updateSex,
    updateDescription,
    updatePhoto,
    updateLocation,
    updatePassword,
    banUser,
    unbanUser,
    getUserByEmail,
    getUserById,
    deleteUser,
    updatePreferences,
    updateUser,
    updateType,
}