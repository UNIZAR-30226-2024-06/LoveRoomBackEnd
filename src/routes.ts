import express from 'express';
import { SalaController } from './controllers/salaController';
import { UsuarioController } from './controllers/usuarioController';
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


router.post('/registrar', async (req, res) => {
  try {
    await UsuarioController.registerUsuario(JSON.stringify(req.body));
    res.status(201).json({ message: 'Usuario creado con exito' });
  } 
  catch (error) {
    console.error(error);
    if (error instanceof Error){
      res.status(500).json({ error: error.message });
    }
  }
});

router.post('/login', async (req, res) => {

  try{
    const user = await UsuarioController.loginUsuario(JSON.stringify(req.body));
    if(user){
      res.json("Autenticado correctamente");
    }
    else{
      res.status(401).json({ error: 'Usuario y/o contraseña incorrectos' });
    }
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
});

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


export default router;