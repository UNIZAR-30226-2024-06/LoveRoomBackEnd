import express from 'express';
import { SalaController } from './controllers/salaController';

const router = express.Router();

router.get('/ver_video/:urlvideo/:correo', async (req, res) => {
    const { urlvideo, correo } = req.params;
    try {
      const salaUrl = await SalaController.verVideo(urlvideo, correo);
      res.redirect(salaUrl);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al manejar salas' });
    }
  });

router.get('/sala/:idUsuarioMatch', SalaController.sincronizarUsuarios);

export default router;