import express from 'express';
import { SalaController } from './controllers/salaController';
import { prisma } from './index';


const router = express.Router();

router.get('/', (req, res) => {
  res.send('Home page');
});

// Ruta de prueba para conexion del frontend con el backend
router.get('/api/test', (req, res) => {
  // Devolvemos un .json con un mensaje de prueba
  console.log('Test route');
  res.json({ message: 'Test route' });
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