import express from 'express';
import { SalaController } from './controllers/salaController';
import { UsuarioController } from './controllers/usuarioController';
import { autenticacionController } from './controllers/autentiacionController';
import { prisma } from '.';

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

router.use(express.json());


router.post('/registrar', UsuarioController.existeUsuario, UsuarioController.registerUsuario);

router.post('/login', UsuarioController.loginUsuario, autenticacionController.crearToken);
//router.delete('/delete/:correo', UsuarioController.eliminarUsuario);


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


export default router;