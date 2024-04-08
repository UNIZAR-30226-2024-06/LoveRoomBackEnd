import express from "express";
import SalaController  from "./controllers/salaController";
import VideoController from './controllers/videoController';
import { prisma } from "./index";
import { UsuarioController } from "./controllers/usuarioController";
import { autenticacionController } from "./controllers/autenticacionController";
import MensajeController from './controllers/mensajeController';
import MultimediaController from './controllers/multimediaController';
import {upload} from './storage';

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Home page");
});

//------------------------------------------------Rutas de prueba------------------------------------------------
//Ruta de prueba que devuelve todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.usuario.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta de prueba GET para conexion del frontend con el backend
router.get("/test", (req, res) => {
  // Devolvemos un .json con un mensaje de prueba
  console.log("Test route get");
  res.json({ message: "Test route" });
});

// Ruta de prueba POST para conexion del frontend con el backend
router.post("/test", (req, res) => {
  console.log("Test route post");
  const { usuario, correo } = req.body;
  const id = req.body.id;
  // el status 201 indica que se ha creado un recurso, no es necesario pero es buena practica
  res.status(201).json({
    mensaje: "Usuario creado",
    usuario,
    correo,
    id,
  });
});

// Ruta para obtener la lista de usuarios viendo un video
// router.get('/video/:url/users', async (req, res) => {
//   try {
//     const { url } = req.params;

//     // Consulta a la base de datos para obtener la lista de usuarios viendo el video
//     const users = await prisma.videoyoutube.findMany({
//       where: {
//         urlvideo: url
//       },
//       select: {
//         idusuario: true // Solo se selecciona el id del usuario
//       }
//     });

//     // Se envía la lista de usuarios en formato JSON
//     res.json(users);
//   } catch (error) {
//     console.error('Error retrieving users:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

//------------------------------------------------Rutas de videos------------------------------------------------

router.get('/videos/interest', autenticacionController.checkAuthUser, VideoController.videosInteres);

router.get('/videos/watch/:idVideo', autenticacionController.checkAuthUser, SalaController.verVideo);

//------------------------------------------------Rutas de salas------------------------------------------------

router.get('/rooms', autenticacionController.checkAuthUser, SalaController.getAllSalasUsuario);

router.get('/rooms/:idSala/members', SalaController.getParticipantesSala);

router.get('/rooms/:idSala/state/:idUsuario', SalaController.getSalaSincronizada);

router.put('/rooms/:idSala/state/:idUsuario', SalaController.setEstadoSala);

router.delete('/rooms/:idSala', SalaController.deleteSala);

//------------------------------------------------Rutas de mensajes------------------------------------------------

router.post('/:idSala/mensaje', MensajeController.createMensaje);

router.get('/:idSala/chat', MensajeController.getMensajesSala);

//router.delete('/:idSala/mensaje/:idMensaje', MensajeController.deleteMensaje); // FALTA IMPLEMENTAR

router.post('/reports/:idMensaje', autenticacionController.checkAuthUser, MensajeController.reportMessage);

router.get('/reports', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, MensajeController.getAllReports);

router.get('/reports/:idReport', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, MensajeController.getReportById);

router.patch('/reports/:idReport/resolve', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, MensajeController.resolveReport);

router.delete('/reports/:idReport', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, MensajeController.deleteReport);

//------------------------------------------------Rutas de multimedia------------------------------------------------

router.post('/multimedia/upload/foto/:idUsuario', upload.single('file'), (req,res) => {
  MultimediaController.uploadFoto(req, res);
});

router.post('/multimedia/upload/video/:idUsuario', upload.single('file'), (req,res) => {
  MultimediaController.uploadVideo(req, res);
});

router.get('/multimedia/:nombreArchivo/:idUsuario', MultimediaController.getMultimedia);

router.delete('/multimedia/delete/:nombreArchivo', MultimediaController.deleteMultimedia);



//------------------------------------------------Rutas de usuarios------------------------------------------------

// Crea un nuevo usuario
router.post('/user/create', UsuarioController.mailAlreadyUse, UsuarioController.registerUser, autenticacionController.crearToken);

// Inicia sesion con un nuevo usuario
router.post('/user/login', UsuarioController.loginUser, autenticacionController.crearToken);

router.get('/users', async (req, res) => {
  try{
    const users = await prisma.usuario.findMany();
    res.json(users);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Obtener un usuario con todos los datos
router.get('/user/:id', autenticacionController.checkAuthUser, UsuarioController.getUser);

// Obtener un dato concreto de un usuario
router.get('/user/:email/id', autenticacionController.checkAuthUser, UsuarioController.getId);
router.get('/user/:id/email', autenticacionController.checkAuthUser, UsuarioController.getEmail);
//router.get('/user/:id/password', autenticacionController.checkAuthUser, UsuarioController.getPassword);
router.get('/user/:id/name', autenticacionController.checkAuthUser,  UsuarioController.getName);
router.get('/user/:id/age', autenticacionController.checkAuthUser, UsuarioController.getAge);
router.get('/user/:id/sex', autenticacionController.checkAuthUser, UsuarioController.getSex);
router.get('/user/:id/description', autenticacionController.checkAuthUser, UsuarioController.getDescription);
router.get('/user/:id/photo', autenticacionController.checkAuthUser, UsuarioController.getPhoto);
router.get('/user/:id/location', autenticacionController.checkAuthUser, UsuarioController.getLocation);
router.get('/user/:id/preferences', autenticacionController.checkAuthUser, UsuarioController.getPreferences);
router.get('/user/:id/type', autenticacionController.checkAuthUser, UsuarioController.getType);


// Eliminacion de un usuario
router.delete('/user/delete', autenticacionController.checkAuthUser, UsuarioController.deleteUser);

// Actualizacion de un usario entero
router.put('/user/update', autenticacionController.checkAuthUser, UsuarioController.mailAlreadyUse, UsuarioController.updateUser);

// Actualizaciones parciales de los datos
router.patch('/user/update/email', autenticacionController.checkAuthUser, UsuarioController.mailAlreadyUse, UsuarioController.updateEmail);
router.patch('/user/update/password', autenticacionController.checkAuthUser, UsuarioController.updatePassword);
router.patch('/user/update/name', autenticacionController.checkAuthUser,  UsuarioController.updateName);
router.patch('/user/update/age', autenticacionController.checkAuthUser, UsuarioController.updateAge);
router.patch('/user/update/sex', autenticacionController.checkAuthUser, UsuarioController.updateSex);
router.patch('/user/update/description', autenticacionController.checkAuthUser, UsuarioController.updateDescription);
router.patch('/user/update/photo', autenticacionController.checkAuthUser, UsuarioController.updatePhoto);
router.patch('/user/update/location', autenticacionController.checkAuthUser, UsuarioController.updateLocation);
router.patch('/user/update/preferences', autenticacionController.checkAuthUser, UsuarioController.updatePreferences);


// Actualizar el tipo de usuario a admin, solo puede ser realizado por un admin
router.patch('/user/update/type/admin', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, UsuarioController.updateAdmin);
// Actualizar el tipo de usuario a premium o normal: normal, premium
router.patch('/user/update/type/:type', autenticacionController.checkAuthUser, UsuarioController.updateType);

// Banear a un usuario, solo puede ser realizado por un admin
router.patch('/user/ban', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, UsuarioController.banUser);
router.patch('/user/unban', autenticacionController.checkAuthUser, autenticacionController.checkAdmin, UsuarioController.unbanUser);

// Comprobar token
router.get('/user/check/token', autenticacionController.checkToken);

//router.post('/user/refresh/password', UsuarioController.refreshPassword);


export default router;