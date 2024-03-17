import express from 'express';
import { SalaController } from './controllers/salaController';
import { prisma } from './index';


const router = express.Router();

router.get('/', (req, res) => {
  res.send('Home page');
});

//Ruta de prueba que devuelve todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const users = await prisma.usuario.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta de prueba GET para conexion del frontend con el backend
router.get('/test', (req, res) => {
  // Devolvemos un .json con un mensaje de prueba
  console.log('Test route get');
  res.json({ message: 'Test route' });
});

// Ruta de prueba POST para conexion del frontend con el backend
router.post('/test', (req, res) => {
  console.log('Test route post');
  const { usuario, correo } = req.body;
  const id = req.body.id;
  // el status 201 indica que se ha creado un recurso, no es necesario pero es buena practica
  res.status(201).json({
    mensaje: 'Usuario creado',
    usuario,
    correo,
    id});
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

router.get('/ver_video/prueba/usuario1', async (req, res) => {
    //const { urlvideo, correo } = req.params;
    const urlvideo = "test_video_url";
    const correo = "usuario1";
    try {
      const salaUrl = await SalaController.verVideo(urlvideo, correo);
      res.redirect(salaUrl);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al manejar salas' });
    }
  });

router.get('/sala/:idUsuarioMatch',);

export default router;