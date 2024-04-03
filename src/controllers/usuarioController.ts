import { Request, Response, NextFunction } from 'express';
import { autenticacionController } from './autenticacionController';
import userBD from '../db/usuarios';
import { usuario } from '@prisma/client';

class UsuarioController {

  /**
   * Registra un usuario en la base de datos.
   * El usuario se registra con un correo, nombre y contraseña.
   */
  public static async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body;
    try {
      console.log(info);
      const newUser = await userBD.createUser(info.correo, info.nombre, info.contrasena);
      //res.status(201).json( "Usuario creado correctamente" )
      req.body.id = newUser.id;
      next();
    } 
    catch (error) {
      res.status(500).send({ error: 'Error al crear el usuario' });
    }
  }

  /**
   * Autentica un usuario en la base de datos.
   * El usuario se autentica con un correo y una contraseña.
   * Si el usuario no existe o la contraseña es incorrecta, se devuelve un error
   * SI el usuario está baneado, se devuelve un error
   * Si se autentica correctamente, pasa al siguiente middleware.
   */
  public static async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body; 
    try {
      console.log(info);
      const user = await userBD.getUserByEmail(info.correo);
      if (user == null || user.contrasena != info.contrasena ) {
        res.status(401).json({ error: 'Usuario y/o contraseña incorrectos' });
      }
      else if (user.baneado) {
        res.status(403).json({ error: 'El usuario está baneado' });
        
      }
      else {
        console.log('Autenticado correctamente');
        req.body.id = user.id;
        next();
      }
    } 
    catch (error) {
      res.status(500).json({ error: 'Error al buscar el usuario' });
    }
  }

  /**
   * Actualiza un usuario al completo.
   * El usuario se identifica con el token.
   */
  public static async updateUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateUser(id, JSON.stringify(info));
      res.json("Usuario actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  }

  /**
   * Actualiza el correo de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza el nombre de un usuario.
   * El usuario se identifica con el token.
   */
  public static async updateName(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.updateName(id, info.nombre);
      res.json("Nombre actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el nombre' });
    }
  }

  /**
   * Actualiza la edad de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza el sexo de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza la descripción de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza la foto de perfil de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza la localización de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza las preferencias de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza la contraseña de un usuario.
   * El usuario se identifica con el token.
   */
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

  /**
   * Actualiza el tipo de un usuario a premiun.
   * El usuario se identifica con el token.
   */
  public  static async updatePremiun(req: Request, res: Response): Promise<any> {
    const id = autenticacionController.getPayload(req).id;   
    console.log(req.params.type);
    try {
      const user = await userBD.updateType(id, req.params.type);  //normal, premium, administrador
      res.json("Tipo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el tipo a premiun' });
    }
  }

  /**
   * Actualiza el tipo de un usuario a administrador.
   * Solo un administrador puede actualizar el tipo de un usuario a administrador.
   * El usuario a actualizar se identifica con el id y se pasa en el body.
   */
  public static async updateAdmin(req: Request, res: Response): Promise<any> {
    const id = req.body.id;
    try {
      const user = await userBD.updateType(id, "administrador");  //normal, premium, administrador
      res.json("Tipo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el tipo a administrador' });
    }
  }

  /**
   * Banea a un usuario
   * El usuario a baenar se identifica con el id y se pasa en el body
   * Solo un administrador puede banear a un usuario
   */
  public static async banUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const user = await userBD.banUser(info.id);
      res.json("Usuario baneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al banear el usuario' });
    }
  }

  /**
   * Desbanea a un usuario
   * El usuario a desbanear se identifica con el id y se pasa en el body
   * Solo un administrador puede desbanear a un usuario
   */
  public static async unbanUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const user = await userBD.unbanUser(info.id);
      res.json("Usuario desbaneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al desbanear el usuario' });
    }
  }

  /**
   * Obtiene un usuario por su id
   * El usuario se identifica con el token.
   */
  public static async getUser(req: Request, res: Response): Promise<void> {
    const email = req.params.email;
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

  /**
   * Comprueba si un correo ya está en uso.
   * Si el correo ya está en uso, devuelve un error.
   * Si el correo no está en uso, pasa al siguiente middleware.
   */
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

  /**
   * Comprueba si un usuario está baneado.
   * El usuario se identifica con el token.
   */
  public static async deleteUser(req: Request, res: Response): Promise<void> {
    const id = autenticacionController.getPayload(req).id;
    try {
      const user = await userBD.deleteUser(id);
      res.json("Usuario eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }

  public static async getEmail(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({correo: user.correo});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el correo' });
    }
  }


  public static async getName(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({nombre: user.nombre});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el nombre' });
    }
  }

  public static async getPassword(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({contrasena: user.contrasena});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la contraseña' });
    }
  }

  public static async getAge(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({nombre: user.edad});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la edad' });
    }
  }

  public static async getDescription(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({descripcion: user.descripcion});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la descripción' });
    }
  }

  public static async getSex(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({sexo: user.sexo});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el sexo' });
    }
  }

  public static async getPhoto(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({foto: user.fotoperfil});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la foto' });
    }
  }

  public static async getLocation(req: Request, res: Response): Promise<void> {
    try{
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({localizacion: user.idlocalidad});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la localidad' });
    }
  }


  


}

export { UsuarioController };