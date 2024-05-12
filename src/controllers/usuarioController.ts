import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import userBD from '../db/usuarios';
import { getMatchesUsuario } from '../db/match';
import { deleteAllSalasUsuario } from '../db/salas';

const UsuarioController = {

  /**
   * Registra un usuario en la base de datos.
   * El usuario se registra con un correo, nombre y contraseña.
   */
  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const info = req.body;
      if (info.nombre == "") {
        res.status(400).json({ error: 'Es necesario introducir un nombre' });
        return
      }
      else if (info.correo == "") {
        res.status(400).json({ error: 'Es necesario introducir un correo' });
        return
      }
      else if (info.contrasena == "") {
        res.status(400).json({ error: 'Es necesario introducir una contraseña' });
        return
      }
      console.log(info);
      const encryptedPass = await bcrypt.hash(info.contrasena, 10);
      const newUser = await userBD.createUser(info.nombre, info.correo, encryptedPass);
      //res.status(201).json( "Usuario creado correctamente" )
      req.body.id = newUser.id;
      next();
    } 
    catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Error al crear el usuario' });
    }
  },

  /**
   * Autentica un usuario en la base de datos.
   * El usuario se autentica con un correo y una contraseña.
   * Si el usuario no existe o la contraseña es incorrecta, se devuelve un error
   * SI el usuario está baneado, se devuelve un error
   * Si se autentica correctamente, pasa al siguiente middleware.
   */
  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body; 
    try {
      console.log(info);
      const user = await userBD.getUserByEmail(info.correo);
      const userPass = await userBD.getPasswordByEmail(info.correo);
      const isCorrect = userPass?.contrasena ? await bcrypt.compare(info.contrasena, userPass?.contrasena) : false;
      console.log(userPass?.contrasena);
      if ( info.correo == "" ){
        res.status(400).json({ error: 'Es necesario introducir un correo' });
      }
      else if ( user == null ) {
        res.status(401).json({ error: 'El usuario introducido no existe' });
      } 
      else if ( info.contrasena == "" ){
        res.status(400).json({ error: 'Es necesario introducir una contraseña' });
      }
      else if (!isCorrect ) {
        res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      else if (user.baneado) {
        res.status(403).json({ error: 'El usuario está baneado' });
      } else {
        console.log('Autenticado correctamente');
        req.body.id = user.id;
        next();
      }
    } 
    catch (error) {
      res.status(500).json({ error: 'Error al buscar el usuario' });
    }
  },

  /**
   * Comprueba si un correo ya está en uso.
   * Si el correo ya está en uso, devuelve un error.
   * Si el correo no está en uso, pasa al siguiente middleware.
   */
  async mailAlreadyUse(req: Request, res: Response, next: NextFunction): Promise<void> {
    const info = req.body;
    if (info.correo == "") {
      res.status(400).json({ error: 'Es necesario introducir un correo' });
      return
    }
    try {
      const user = await userBD.getUserByEmail(info.correo);
      if (user != null && user.id != req.body.idUser) {
        res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
        return;
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al chequear el correo' });
    }
  },

  /**
   * Actualiza un usuario al completo.
   * El usuario se identifica con el token.
   */
  async updateUser(req: Request, res: Response): Promise<any> {
    console.log("Actualizando usuario");
    const info = req.body;
    const id = req.body.idUser;
    delete info.idUser;
    console.log(info);
    try {
      const user = await userBD.updateUser(id,JSON.stringify(info));
      console.log(user);
      res.json("Usuario actualizado correctamente");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  },

  /**
   * Actualiza el correo de un usuario.
   * El usuario se identifica con el token.
   */
  async updateEmail(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateEmail(id, info.correo);
      res.json("Correo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el correo' });
    }
  },

  /**
   * Actualiza el nombre de un usuario.
   * El usuario se identifica con el token.
   */
  async updateName(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateName(id, info.nombre);
      res.json("Nombre actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el nombre' });
    }
  },

  /**
   * Actualiza la edad de un usuario.
   * El usuario se identifica con el token.
   */
  async updateAge(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateAge(id, info.edad);
      res.json("Edad actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la edad' });
    }
  },

  /**
   * Actualiza el sexo de un usuario.
   * El usuario se identifica con el token.
   */
  async updateSex(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateSex(id, info.sexo);
      res.json("Sexo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el sexo' });
    }
  },

  /**
   * Actualiza la descripción de un usuario.
   * El usuario se identifica con el token.
   */
  async updateDescription(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateDescription(id, info.descripcion);
      res.json("Descripción actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la descripción' });
    }
  },

  /**
   * Actualiza la foto de perfil de un usuario.
   * El usuario se identifica con el token.
   */
  async updatePhoto(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updatePhoto(id, info.fotoperfil);
      res.json("Foto de perfil actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la foto de perfil' });
    }
  },

  /**
   * Actualiza la localización de un usuario.
   * El usuario se identifica con el token.
   */
  async updateLocation(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updateLocation(id, info.idlocalidad);
      res.json("Localización actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la localización' });
    }
  },

  /**
   * Actualiza las preferencias de un usuario.
   * El usuario se identifica con el token.
   */
  async updatePreferences(req: Request, res: Response): Promise<any> {
    const info = req.body;
    const id = req.body.idUser
    try {
      const user = await userBD.updatePreferences(id, JSON.stringify(info));
      res.json("Preferencias actualizadas correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar las preferencias' });
    }
  },

  /**
   * Actualiza la contraseña de un usuario.
   * El usuario se identifica con el token.
   */
  async updatePassword(req: Request, res: Response): Promise<any> {
    try {
      const info = req.body;
      const id = req.body.idUser
      const userPass = await userBD.getPasswordById(id);
      const isSame = userPass?.contrasena ? await bcrypt.compare(info.antiguaContrasena, userPass?.contrasena) : false;
      if (!isSame) {
        res.status(401).json({ error: 'Contraseña incorrecta' });
        return;
      }
      const user = await userBD.updatePassword(id, await bcrypt.hash(info.nuevaContrasena, 10));
      res.json("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
  },

  /**
   * Actualiza el tipo de un usuario a premiun.
   * Se actualiza segun el tipo introducido en la ulr (normal, premium)
   * El usuario se identifica con el token.
   */
  async updateType(req: Request, res: Response): Promise<any> {
    //const id = req.body.idUser
    const id = req.body.id;   
    console.log(req.params.type);
    try {
      const user = await userBD.updateType(id, req.params.type);  //normal, premium, administrador
      res.json("Tipo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el tipo a premiun' });
    }
  },

  /**
   * Actualiza el tipo de un usuario a administrador.
   * Solo un administrador puede actualizar el tipo de un usuario a administrador.
   * El usuario a actualizar se identifica con el id y se pasa en el body.
   */
  async updateAdmin(req: Request, res: Response): Promise<any> {
    const id = req.body.id;
    try {
      const user = await userBD.updateType(id, "administrador");  //normal, premium, administrador
      res.json("Tipo actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el tipo a administrador' });
    }
  },

  /**
   * Banea a un usuario
   * El usuario a baenar se identifica con el id y se pasa en el body
   * Solo un administrador puede banear a un usuario
   */
  async banUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const user = await userBD.banUser(info.id);
      res.json("Usuario baneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al banear el usuario' });
    }
  },

  /**
   * Desbanea a un usuario
   * El usuario a desbanear se identifica con el id y se pasa en el body
   * Solo un administrador puede desbanear a un usuario
   */
  async unbanUser(req: Request, res: Response): Promise<any> {
    const info = req.body;
    try {
      const user = await userBD.unbanUser(info.id);
      res.json("Usuario desbaneado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al desbanear el usuario' });
    }
  },

  /**
   * Comprueba si un usuario está baneado.
   * El usuario se identifica con el token.
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    const id = req.body.idUser
    try {
      console.log('Borrando usuario: ', id);
      const borradas = await deleteAllSalasUsuario(id);
      console.log('Salas borradas: ', borradas);
      const user = await userBD.deleteUser(id);
      res.json("Usuario eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  },

  /**
   * Obtiene un usuario por su correo
   * El usuario se identifica con el token.
   */
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  },

  /**
   * Devuelve el id de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getId(req: Request, res: Response): Promise<void> {
    try{
      //const id = parseInt(req.params.id);
      //const user = await userBD.getUserById(id);
      const email = req.params.email;
      const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({id: user.id});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el id' });
    }
  },

  /**
   * Devuelve el correo de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getEmail(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({correo: user.correo});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el correo' });
    }
  },

  /**
   * Devuelve el nombre de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getName(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({nombre: user.nombre});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el nombre' });
    }
  },

  /**
   * Devuelve la contraseña de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getPassword(req: Request, res: Response): Promise<void> {
    try{
      const id = req.body.userId
      const user = await userBD.getPasswordById(id);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({contrasena: user.contrasena});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la contraseña' });
    }
  },

  /**
   * Devuelve la edad de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getAge(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({edad: user.edad});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la edad' });
    }
  },

  /**
   * Devuelve la descripción de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getDescription(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({descripcion: user.descripcion});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la descripción' });
    }
  },

  /**
   * Devuelve el sexo de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getSex(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({sexo: user.sexo});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el sexo' });
    }
  },

  /**
   * Devuelve la foto de perfil de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getPhoto(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({fotoperfil: user.fotoperfil});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la foto' });
    }
  },

  /**
   * Devuelve la id de la localidad de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getLocation(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({idlocalidad: user.idlocalidad});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener la localidad' });
    }
  },

  /**
   * Devuelve las preferencias de un usuario.
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getPreferences(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({buscaedadmax: user.buscaedadmax,
                buscaedadmin: user.buscaedadmin,
                buscasexo: user.buscasexo,});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener las preferencias' });
    }
  },

  /**
   * Devuelve el tipo de usuario (administrados, normal, premium).
   * El usuario se pasa como parametro en la url
   * Necesita autenticación.
   */
  async getType(req: Request, res: Response): Promise<void> {
    try{
      const id = parseInt(req.params.id);
      const user = await userBD.getUserById(id);
      //const email = req.params.email;
      //const user = await userBD.getUserByEmail(email);
      if (user == null) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.send({tipousuario: user.tipousuario});
    }
    catch (error) {
      res.status(500).json({ error: 'Error al obtener el tipo' });
    }
  },

  async userExits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body.correo;
      const user = await userBD.getUserByEmail(email);
      if (req.body.correo == "") {
        res.status(400).json({ error: 'Es necesario introducir un correo' });
        return
      }
      else if (user == null) {
        res.status(404).json({ error: 'El usuario introducido no existe' });
        return;
      }
      console.log ("Usuario encontrado al cambiar contraseña")
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar el usuario' });
    }
  },

  async getUsers(req: Request, res: Response): Promise<void> {
    try{
      const users = await userBD.getUsers();
      console.log(users);
      res.json(users);
    }
    catch(error){
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  },

  async checkMatchUser(req: Request, res: Response, next: NextFunction) : Promise<any> {
    const idOtherUser = req.params.id;
    const idUserToken = req.body.idUser;
    try {
      if ( idOtherUser == idUserToken ) {
        console.log("Perfil personal");
        next();
      }
      const matches = await getMatchesUsuario(idUserToken.toString());
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].id == parseInt(idOtherUser)) {
          next();
        }
      }
      res.status(403).json({ error: 'No hay match con el usuario buscado' });
    }
    catch(error){
      res.status(500).json({ error: 'Error al comprobar si hay match con el usuario' });
    }
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    try{
      console.log(req.body);
      const id = parseInt(req.body.idUser);
      const user = await userBD.getUserById(id);
      console.log(user);
      if (user == null) {
        res.status(404).json({ error: 'Perfil no encontrado' });
        return;
      }
      res.json(user);
    }
    catch(error){
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el perfil' });
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const info = req.body;
      const id = await userBD.getUserByEmail(info.correo).then((user) => user?.id);
      if (id == null) {
        res.status(404).json({ error: 'El usuario introducido no existe' });
        return;
      }
      if ( info.nuevaContrasena == "" ){
        res.status(400).json({ error: 'Es necesario introducir una contraseña' });
        return
      }
      req.body.id = id;
      console.log ("Usuario encontrado al resetear contraseña")
      const user = await userBD.updatePassword(id, await bcrypt.hash(info.nuevaContrasena, 10));
      console.log("Contraseña actualizada correctamente");
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al resetear la contraseña' });
    }
  }
    
}

export { UsuarioController };
