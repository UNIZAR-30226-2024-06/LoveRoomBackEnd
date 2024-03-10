import { prisma } from '../index';

class UsuarioController {
    
  public static async registerUsuario(info: string): Promise<void> {
    try {
      console.log(info);
      const infoJson = JSON.parse(info);
      if (await this.existeUsuario(infoJson.correo)) {
        throw new Error('repetido');
      }
      const nuevoUSuario = await prisma.usuario.create({
        data: {
          correo: infoJson.correo,
          nombre: infoJson.nombre,
          descripcion: infoJson.descripcion,
          contrasena: infoJson.contrasena,
          edad: infoJson.edad,
          sexo: infoJson.sexo,
          preferencias: infoJson.preferencias,
          tipousuario: infoJson.tipousuario,
        },
      });
    } 
    catch (error) {
      console.log(error);
      if (error instanceof Error){
        switch (error.message) {
          case 'repetido':
            throw new Error('Usuario ya registrado');
            break;
          default:
            throw new Error('Error al crear el usuario');
            break;
        }
      }
      
    }
  }

  public static async loginUsuario(info: string): Promise<boolean> {
    try {
      console.log(info);
      const infoJson = JSON.parse(info);
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: infoJson.correo,
        },
      });

      if (usuario != null && usuario.contrasena === infoJson.contrasena) {
        console.log('Usuario encontrado');
        return true;
      }
      return false;
    } 
    catch (error) {
      throw new Error('Error al buscar el usuario');
    }
  }

  public static async updateUsuario(info: string): Promise<any> {
    
  }

  private static async existeUsuario(correo: string): Promise<boolean> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: correo,
        },
      });
      if (usuario != null) {
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Error al buscar el usuario');
    }
  }
}

export { UsuarioController };