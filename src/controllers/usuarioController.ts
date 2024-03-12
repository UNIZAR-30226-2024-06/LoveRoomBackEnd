import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';

class UsuarioController {

  public static async registerUsuario(req: Request, res: Response): Promise<void> {
    const info = req.body;
    try {
      console.log(info);
      const nuevoUSuario = await prisma.usuario.create({
        data: {
          correo: info.correo,
          nombre: info.nombre,
          descripcion: info.descripcion,
          contrasena: info.contrasena,
          edad: info.edad,
          sexo: info.sexo,
          preferencias: info.preferencias,
          tipousuario: info.tipousuario,
        },
      });
      res.status(201).json("Usuario creado correctamente")
    } 
    catch (error) {
      res.status(500).send({ error: 'Error al crear el usuario' });
    }
  }

  public static async loginUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body; 
    try {
      console.log(info);
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: info.correo,
        },
      });

      if (usuario != null && usuario.contrasena === info.contrasena) {
        console.log('Autenticado correctamente');
        next();
      }
      else{
        res.status(401).json({ error: 'Usuario y/o contraseña incorrectos' });
      }
    } 
    catch (error) {
      res.status(500).json({ error: 'Error al buscar el usuario' });
    }
  }

  public static async updateUsuario(info: string): Promise<any> {
    
  }

  public static async existeUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: info.correo,
        },
      });
      if (usuario != null) {
        res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
  }

  public static async eliminarUsuario(req: Request, res: Response): Promise<void> {
    const correo = req.params.correo;
    try {
      const usuario = await prisma.usuario.delete({
        where: {
          correo: correo,
        },
      });
      res.json("Usuario eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }

  public static async estaBan(req: Request, res: Response, next: NextFunction): Promise<any> {
    /*
    const info = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: info.correo,
        },
      });
      if (usuario != null && usuario.baneado) {
        res.json({ error: 'El usuario está baneado' });
        return;
      }
      next();
    } catch (error) {
      res.json({ error: 'Error al conectar con la base de datos' });
    }
    */
  }
}

export { UsuarioController };