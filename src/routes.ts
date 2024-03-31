import express from 'express';
import { UsuarioController } from './controllers/usuarioController';
import { autenticacionController } from './controllers/autentiacionController';
import { prisma } from '.';

const router = express.Router();

router.use(express.json());


router.post('/user/create', UsuarioController.mailAlreadyUse, UsuarioController.registerUser);

router.post('/user/login', UsuarioController.loginUser, autenticacionController.crearToken);

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

// Obtener un usuario
router.get('/user/:correo', autenticacionController.comprobarAutenticacion, UsuarioController.getUser);

// Actualizaciones parciales de los datos
router.put('/update/:id', autenticacionController.comprobarAutenticacion, UsuarioController.updateUser);
router.patch('/update/email', autenticacionController.comprobarAutenticacion, UsuarioController.mailAlreadyUse, UsuarioController.updateEmail);
//router.patch('/update/password', autenticacionController.comprobarAutenticacion, UsuarioController.updatePassword);
router.patch('/update/name', autenticacionController.comprobarAutenticacion, UsuarioController.updateName);
router.patch('/update/age', autenticacionController.comprobarAutenticacion, UsuarioController.updateAge);
router.patch('/update/sex', autenticacionController.comprobarAutenticacion, UsuarioController.updateSex);
router.patch('/update/description', autenticacionController.comprobarAutenticacion, UsuarioController.updateDescription);
router.patch('/update/photo', autenticacionController.comprobarAutenticacion, UsuarioController.updatePhoto);
router.patch('/update/location', autenticacionController.comprobarAutenticacion, UsuarioController.updateLocation);
router.patch('/update/preferences', autenticacionController.comprobarAutenticacion, UsuarioController.updatePreferences);
router.patch('/user/ban', autenticacionController.comprobarAutenticacion, UsuarioController.banUser);

router.delete('/user/delete', autenticacionController.comprobarAutenticacion, UsuarioController.deleteUser);

export default router;