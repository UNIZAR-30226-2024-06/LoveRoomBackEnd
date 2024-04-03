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


//------------------------------------------------Rutas de salas------------------------------------------------

router.get('/salas/:idUsuario', SalaController.getAllSalasUsuario);

router.get('/salas/participantes/:idSala', SalaController.getParticipantesSala);

router.get('/ver_video/:idVideo/:idUsuario', SalaController.verVideo);

router.get('/sala/:idSala/get_estado/:idUsuario', SalaController.getSalaSincronizada);

router.put('/sala/:idSala/set_estado/:idUsuario', SalaController.setEstadoSala);

router.delete('/sala/:idSala/delete', SalaController.deleteSala);

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
