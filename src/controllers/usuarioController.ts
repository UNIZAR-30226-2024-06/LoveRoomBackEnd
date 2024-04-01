import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';
import { autenticacionController } from './autenticacionController';
import { ConversationContextImpl } from 'twilio/lib/rest/conversations/v1/conversation';
import userBD from '../db/usuarios';

class UsuarioController {

  public static async registerUser(req: Request, res: Response): Promise<void> {
    const info = req.body;
    try {
      console.log(info);
      const newUser = await userBD.createUser(info.correo, info.nombre, info.contrasena);
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
      const user = await userBD.getUserByEmail(info.correo);
      if (user != null && user.contrasena === info.contrasena) {
        console.log('Autenticado correctamente');
        req.body.id = user.id;
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
      const user = await userBD.updateUser(id, JSON.stringify(info));
      res.json("Usuario actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  }

  public static async updateEmail(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateEmail(id, info.correo);
      res.json("Correo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el correo' });
    }
  }

  public static async updateName(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      console.log(id, info.nombre);
      const user = await userBD.updateName(id, info.nombre);
      res.json("Nombre actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el nombre' });
    }
  }

  public static async updateAge(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateAge(id, info.edad);
      res.json("Edad actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la edad' });
    }
  }

  public static async updateSex(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateSex(id, info.sexo);
      res.json("Sexo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el sexo' });
    }
  }

  public static async updateDescription(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateDescription(id, info.descripcion);
      res.json("Descripción actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la descripción' });
    }
  }

  public static async updatePhoto(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updatePhoto(id, info.fotoperfil);
      res.json("Foto de perfil actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la foto de perfil' });
    }
  }

  public static async updateLocation(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateLocation(id, info.idlocalidad);
      res.json("Localización actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la localización' });
    }
  }

  public static async updatePreferences(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updatePreferences(id, JSON.stringify(info));
      res.json("Preferencias actualizadas correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar las preferencias' });
    }
  }

  public static async updatePassword(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updatePassword(id, info.contrasena);
      res.json("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
  }

  public static async banUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const user = await userBD.banUser(info.id);
      res.json("Usuario baneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al banear el usuario' });
    }
  }

  public static async getUser(req: Request, res: Response): Promise<void> {
    const email = req.params.correo;
    try {
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  }

  
  public static async mailAlreadyUse(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body;
    try {
      const user = await userBD.getUserByEmail(info.correo);
      if (user != null) {
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
      const user = await userBD.deleteUser(id);
      res.json("Usuario eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }

  public static async checkStatusUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const info = req.body;
    try {
      const id = autenticacionController.getPayload(req).id;
      const user = await userBD.getUserById(id);
      if (user == null) {
        res.status(404).json({ error: 'El usuario ha sido eliminado' });
        return;
      }
      else if (user != null && user.baneado) {
        res.status(204).json({ error: 'El usuario está baneado' });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
  }
}

export { UsuarioController };