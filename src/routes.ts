import express from "express";
import SalaController  from "./controllers/salaController";
import VideoController from './controllers/videoController';
import MensajeController from './controllers/mensajeController';
import MultimediaController from './controllers/multimediaController';
import {upload} from './storage'
import { prisma} from "./index";

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

//------------------------------------------------Rutas de videos------------------------------------------------

router.get('/videos/interest/:idUsuario', VideoController.videosInteres);

router.get('/videos/:idVideo/watch/:idUsuario', SalaController.verVideo);

//------------------------------------------------Rutas de salas------------------------------------------------

router.get('/users/:idUsuario/rooms', SalaController.getAllSalasUsuario);

router.get('/rooms/:idSala/members', SalaController.getParticipantesSala);

router.get('/room/:idSala/state/:idUsuario', SalaController.getSalaSincronizada);

router.put('/room/:idSala/state/:idUsuario', SalaController.setEstadoSala);

router.delete('/room/:idSala', SalaController.deleteSala);

//------------------------------------------------Rutas de mensajes------------------------------------------------

router.post('/:idSala/mensaje', MensajeController.createMensaje);

router.get('/:idSala/chat', MensajeController.getMensajesSala);

//------------------------------------------------Rutas de multimedia------------------------------------------------

router.post('/multimedia/upload/foto/:idUsuario', upload.single('file'), (req,res) => {
  MultimediaController.uploadFoto(req, res);
});

router.post('/multimedia/upload/video/:idUsuario', upload.single('file'), (req,res) => {
  MultimediaController.uploadVideo(req, res);
});

router.get('/multimedia/:nombreArchivo/:idUsuario', MultimediaController.getMultimedia);

router.delete('/multimedia/delete/:nombreArchivo', MultimediaController.deleteMultimedia);

export default router;
