import express from 'express';
import { UsuarioController } from './controllers/usuarioController';
import { autenticacionController } from './controllers/autentiacionController';
import { prisma } from '.';

const router = express.Router();

router.use(express.json());


router.post('/registrar', UsuarioController.mailAlreadyUse, UsuarioController.registerUser);

router.post('/login', UsuarioController.loginUser, autenticacionController.crearToken);
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