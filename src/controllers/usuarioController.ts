import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';
import { autenticacionController } from './autenticacionController';
import { ConversationContextImpl } from 'twilio/lib/rest/conversations/v1/conversation';

class UsuarioController {

  public static async registerUser(req: Request, res: Response): Promise<void> {
    const info = req.body;
    try {
      console.log(info);
      const nuevoUSuario = await prisma.usuario.create({
        data: {
          correo: info.correo,
          nombre: info.nombre,
          contrasena: info.contrasena,
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
      res.status(201).json("Usuario creado correctamente")
    } 
    catch (error) {
      res.status(500).send({ error: 'Error al crear el usuario' });
    }
  }

  public static async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        req.body.id = await UsuarioController.searchId(info.correo);
        console.log(req.body.id);
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

  public static async updateUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    console.log(id);
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          correo: info.correo,
          nombre: info.nombre,
          contrasena: info.contrasena,
          edad: info.edad,
          sexo: info.sexo,
          buscaedadmin: info.buscaedadmin,
          buscaedadmax: info.buscaedadmax,
          buscasexo: info.buscasexo,
          descripcion: info.descripcion,
          fotoperfil: info.fotoperfil,
          idlocalidad: info.idlocalidad,
        },
      });
      res.json("Usuario actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  }

  public static async updateEmail(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          correo: info.correo,
        },
      });
      res.json("Correo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el correo' });
    }
  }

  public static async updateName(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          nombre: info.nombre,
        },
      });
      res.json("Nombre actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el nombre' });
    }
  }

  public static async updateAge(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          edad: info.edad,
        },
      });
      res.json("Edad actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la edad' });
    }
  }

  public static async updateSex(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          sexo: info.sexo,
        },
      });
      res.json("Sexo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el sexo' });
    }
  }

  public static async updateDescription(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          descripcion: info.descripcion,
        },
      });
      res.json("Descripción actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la descripción' });
    }
  }

  public static async updatePhoto(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          fotoperfil: info.fotoperfil,
        },
      });
      res.json("Foto de perfil actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la foto de perfil' });
    }
  }

  public static async updateLocation(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          idlocalidad: info.idlocalidad,
        },
      });
      res.json("Localización actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la localización' });
    }
  }

  public static async updatePreferences(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          buscaedadmin: info.buscaedadmin,
          buscaedadmax: info.buscaedadmax,
          buscasexo: info.buscasexo,
        },
      });
      res.json("Preferencias actualizadas correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar las preferencias' });
    }
  }

  public static async updatePassword(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: id,
        },
        data: {
          contrasena: info.contrasena,
        },
      });
      res.json("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
  }

  public static async banUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const usuario = await prisma.usuario.update({
        where: {
          correo: info.correo,
        },
        data: {
          baneado: true,
        },
      });
      res.json("Usuario baneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al banear el usuario' });
    }
  }

  public static async getUser(req: Request, res: Response): Promise<void> {
    const email = req.params.correo;
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: email,
        },
        select: {
          id: true,
          correo: true,
          nombre: true,
          //contrasena: true,
          edad: true,
          sexo: true,
          buscaedadmin: true,
          buscaedadmax: true,
          buscasexo: true,
          descripcion: true,
          fotoperfil: true,
          idlocalidad: true,
        }
      });
      if (usuario == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  }

  
  public static async mailAlreadyUse(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    const id = autenticacionController.getPayload(req).id;
    try {
      const usuario = await prisma.usuario.delete({
        where: {
          id: id,
        },
      });
      res.json("Usuario eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }

  public static async checkStatusUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const info = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: info.correo,
        },
      });
      if (usuario == null) {
        res.status(404).json({ error: 'El usuario ha sido eliminado' });
        return;
      }
      else if (usuario != null && usuario.baneado) {
        res.status(204).json({ error: 'El usuario está baneado' });
        return;
      }
      next();
    } catch (error) {
      res.json({ error: 'Error al conectar con la base de datos' });
    }
  }

  private static async searchId(correo: string): Promise<number> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          correo: correo,
        },
      });
      if (usuario != null) {
        return usuario.id;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

export { UsuarioController };