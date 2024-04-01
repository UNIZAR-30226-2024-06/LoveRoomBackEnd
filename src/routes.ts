import express from "express";
import { SalaController } from "./controllers/salaController";
import VideoController from './controllers/videoController';
import { prisma } from "./index";
import { UsuarioController } from "./controllers/usuarioController";
import { autenticacionController } from "./controllers/autenticacionController";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Home page");
});

//------------------------------------------------Rutas de prueba------------------------------------------------
//Ruta de prueba que devuelve todos los usuarios
router.get("/usuarios", async (req, res) => {
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

router.get('/videos/interes/:idUsuario', VideoController.videosInteres);

router.get("/ver_video/prueba/usuario1", async (req, res) => {
  //const { urlvideo, correo } = req.params;
  const urlvideo = "test_video_url";
  const correo = "usuario1";
  try {
    const salaUrl = await SalaController.verVideo(urlvideo, correo);
    res.redirect(salaUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al manejar salas" });
  }
});

router.get("/sala/:idUsuarioMatch");



//------------------------------------------------Rutas de usuarios------------------------------------------------

// Crea un nuevo usuario
router.post('/user/create', /*UsuarioController.mailAlreadyUse,*/ UsuarioController.registerUser);

// Inicia sesion con un nuevo usuario
router.post('/user/login', UsuarioController.loginUser, autenticacionController.crearToken);

router.get('/users', autenticacionController.comprobarAutenticacion, async (req, res) => {
  try{
    const users = await prisma.usuario.findMany();
    res.json(users);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Obtener un usuario
router.get('/user/:correo', autenticacionController.comprobarAutenticacion, UsuarioController.getUser);

// Actualizacion de un usario entero
router.put('/user/update/all', UsuarioController.checkStatusUser, autenticacionController.comprobarAutenticacion, UsuarioController.mailAlreadyUse, UsuarioController.updateUser);

// Eliminacion de un usuario
router.delete('/user/delete', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.deleteUser);

// Actualizaciones parciales de los datos
router.patch('/user/update/email', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.mailAlreadyUse, UsuarioController.updateEmail);
router.patch('/user/update/password', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updatePassword);
router.patch('/user/update/name', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updateName);
router.patch('/user/update/age', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updateAge);
router.patch('/user/update/sex', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updateSex);
router.patch('/user/update/description', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updateDescription);
router.patch('/user/update/photo', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updatePhoto);
router.patch('/user/update/location', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updateLocation);
router.patch('/user/update/preferences', autenticacionController.comprobarAutenticacion, UsuarioController.checkStatusUser, UsuarioController.updatePreferences);

// Banear a un usuario
router.patch('/user/ban', autenticacionController.comprobarAutenticacion, UsuarioController.banUser);

// Comprobar token
router.get('/user/check/token', autenticacionController.checkToken);


export default router;
