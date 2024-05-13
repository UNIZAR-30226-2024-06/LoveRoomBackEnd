import express from "express";
import SalaController from "./controllers/salaController";
import VideoController from "./controllers/videoController";
import { prisma } from "./index";
import { UsuarioController } from "./controllers/usuarioController";
import { autenticacionController } from "./controllers/autenticacionController";
import adminController from "./controllers/adminController";
import MensajeController from "./controllers/mensajeController";
import MultimediaController from "./controllers/multimediaController";
import { CorreoController } from "./controllers/correoController";
import PagosController from "./controllers/pagosController";
import { upload } from "./storage";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Home page");
});

//------------------------------------------------Rutas de prueba------------------------------------------------
//Ruta de prueba que devuelve todos los usuarios
/*
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.usuario.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
*/
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
//------------------------------------------------Rutas admin------------------------------------------------
router.get(
  "/admin/stats/users",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  adminController.getUsuariosStats
);

router.get(
  "/admin/stats/rooms",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  adminController.getSalasStats
);

router.get(
  "/admin/stats/reports",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  adminController.getReportesStats
);

router.get(
  "/admin/stats/users/age",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  adminController.getUsersAgeStats
);

router.get(
  "/admin/stats/users/localidad",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  adminController.getUsersLocalidadStats
);

//------------------------------------------------Rutas de videos------------------------------------------------

router.get(
  "/videos/interest",
  autenticacionController.checkAuthUser,
  VideoController.videosInteres
);

router.post(
  "/videos/watch/:idVideo",
  autenticacionController.checkAuthUser,
  SalaController.verVideo
);

//router.delete('/videos/quit', autenticacionController.checkAuthUser, SalaController.deleteSalaUnitaria);

//------------------------------------------------Rutas de salas------------------------------------------------

router.get(
  "/rooms",
  autenticacionController.checkAuthUser,
  SalaController.getInfoSalasUsuario
);

router.get(
  "/rooms/:idSala/members",
  autenticacionController.checkAuthUser,
  SalaController.getParticipantesSala
);

router.get(
  "/rooms/:idSala/state/:idUsuario",
  autenticacionController.checkAuthUser,
  SalaController.getSalaSincronizada
);

router.put(
  "/rooms/:idSala/rename",
  autenticacionController.checkAuthUser,
  SalaController.setNombreSala
);

router.put(
  "/rooms/:idSala/state/:idUsuario",
  autenticacionController.checkAuthUser,
  SalaController.setEstadoSala
);

router.delete(
  "/rooms/:idSala",
  autenticacionController.checkAuthUser,
  SalaController.deleteSala
);

//------------------------------------------------Rutas de mensajes------------------------------------------------

router.post(
  "/:idSala/mensaje",
  autenticacionController.checkAuthUser,
  MensajeController.createMensaje
);

router.get(
  "/:idSala/chat",
  autenticacionController.checkAuthUser,
  MensajeController.getMensajesSala
);

//router.delete('/:idSala/mensaje/:idMensaje', MensajeController.deleteMensaje); // FALTA IMPLEMENTAR

router.post(
  "/reports/:idMensaje",
  autenticacionController.checkAuthUser,
  MensajeController.reportMessage
);

router.get(
  "/reports",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  MensajeController.getAllReports
);

router.get(
  "/reports/:idReport",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  MensajeController.getReportById
);

router.patch(
  "/reports/:idReport/resolve",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  MensajeController.resolveReport
);

router.delete(
  "/reports/:idReport",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  MensajeController.deleteReport
);

//------------------------------------------------Rutas de multimedia------------------------------------------------

router.post(
  "/multimedia/upload/foto/:idUsuario",
  [upload.single("file"), autenticacionController.checkAuthUser],
  MultimediaController.uploadFoto
);

router.post(
  "/multimedia/upload/video/:idUsuario",
  [upload.single("file"), autenticacionController.checkAuthUser],
  MultimediaController.uploadVideo
);

router.get(
  "/multimedia/send/:nombreArchivo",
  autenticacionController.checkAuthUser,
  MultimediaController.getMultimedia
);

router.delete(
  "/multimedia/delete/:nombreArchivo",
  autenticacionController.checkAuthUser,
  MultimediaController.deleteMultimedia
);

//------------------------------------------------Rutas de pagos------------------------------------------------

router.get(
  "/payment/client_token/",
  autenticacionController.checkAuthUser,
  PagosController.generarEnlacePago
);

router.post(
  "/payment/transaction/",
  autenticacionController.checkAuthUser,
  PagosController.crearPago
);

//------------------------------------------------Rutas de usuarios------------------------------------------------

// Crea un nuevo usuario
router.post(
  "/user/create",
  UsuarioController.mailAlreadyUse,
  UsuarioController.registerUser,
  autenticacionController.crearToken
);

// Inicia sesion con un nuevo usuario
router.post(
  "/user/login",
  UsuarioController.loginUser,
  autenticacionController.crearToken
);

// Ver todos lso usuarios creados
router.get(
  "/users",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  UsuarioController.getUsers
);

// Obtener el perfil del usuario
router.get(
  "/user/profile",
  autenticacionController.checkAuthUser,
  UsuarioController.getProfile
);

// Obtener un usuario con todos los datos
router.get(
  "/user/:id",
  autenticacionController.checkAuthUser,
  UsuarioController.getUser
);

// Obtener un dato concreto de un usuario
//router.get('/user/:email/id', autenticacionController.checkAuthUser,  UsuarioController.getId);
router.get(
  "/user/:id/email",
  autenticacionController.checkAuthUser,
  UsuarioController.getEmail
);
//router.get('/user/:id/password', autenticacionController.checkAuthUser, UsuarioController.getPassword);
router.get(
  "/user/:id/name",
  autenticacionController.checkAuthUser,
  UsuarioController.getName
);
router.get(
  "/user/:id/age",
  autenticacionController.checkAuthUser,
  UsuarioController.getAge
);
router.get(
  "/user/:id/sex",
  autenticacionController.checkAuthUser,
  UsuarioController.getSex
);
router.get(
  "/user/:id/description",
  autenticacionController.checkAuthUser,
  UsuarioController.getDescription
);
router.get(
  "/user/:id/photo",
  autenticacionController.checkAuthUser,
  UsuarioController.getPhoto
);
router.get(
  "/user/:id/location",
  autenticacionController.checkAuthUser,
  UsuarioController.getLocation
);
router.get(
  "/user/:id/preferences",
  autenticacionController.checkAuthUser,
  UsuarioController.getPreferences
);
router.get(
  "/user/:id/type",
  autenticacionController.checkAuthUser,
  UsuarioController.getType
);

// Eliminacion de un usuario
router.delete(
  "/user/delete",
  autenticacionController.checkAuthUser,
  UsuarioController.deleteUser
);

// Actualizacion de un usario entero
router.put(
  "/user/update",
  autenticacionController.checkAuthUser,
  UsuarioController.mailAlreadyUse,
  UsuarioController.updateUser
);

// Actualizaciones parciales de los datos
router.patch(
  "/user/update/email",
  autenticacionController.checkAuthUser,
  UsuarioController.mailAlreadyUse,
  UsuarioController.updateEmail
);
router.patch(
  "/user/update/password",
  autenticacionController.checkAuthUser,
  UsuarioController.updatePassword
);
router.patch(
  "/user/update/name",
  autenticacionController.checkAuthUser,
  UsuarioController.updateName
);
router.patch(
  "/user/update/age",
  autenticacionController.checkAuthUser,
  UsuarioController.updateAge
);
router.patch(
  "/user/update/sex",
  autenticacionController.checkAuthUser,
  UsuarioController.updateSex
);
router.patch(
  "/user/update/description",
  autenticacionController.checkAuthUser,
  UsuarioController.updateDescription
);
router.patch(
  "/user/update/photo",
  autenticacionController.checkAuthUser,
  UsuarioController.updatePhoto
);
router.patch(
  "/user/update/location",
  autenticacionController.checkAuthUser,
  UsuarioController.updateLocation
);
router.patch(
  "/user/update/preferences",
  autenticacionController.checkAuthUser,
  UsuarioController.updatePreferences
);

// Actualizar el tipo de desde el perfil de administrador; Tipos: normal, premium, administrador.
router.patch(
  "/user/update/type/:type",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  UsuarioController.updateTypeFromAdmin
);
// Tipos: normal, premium, administrador

// Banear a un usuario, solo puede ser realizado por un admin
router.patch(
  "/user/ban",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  UsuarioController.banUser
);
router.patch(
  "/user/unban",
  autenticacionController.checkAuthUser,
  autenticacionController.checkAdmin,
  UsuarioController.unbanUser
);

// Comprobar token
router.get("/user/check/token", autenticacionController.checkToken);

// Rutas recuperar contraseña por correo
router.post(
  "/user/send/email",
  UsuarioController.userExits,
  CorreoController.sendEmailForgotPass
);
router.post(
  "/user/check/code",
  UsuarioController.userExits,
  autenticacionController.checkCode.bind(autenticacionController)
);
router.patch(
  "/user/reset/password",
  UsuarioController.userExits,
  autenticacionController.checkCodeMiddleware.bind(autenticacionController),
  UsuarioController.resetPassword,
  autenticacionController.crearToken
);

export default router;
