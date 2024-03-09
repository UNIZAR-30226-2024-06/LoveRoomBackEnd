import express from 'express';
import { SalaController } from './controllers/salaController';


const router = express.Router();

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