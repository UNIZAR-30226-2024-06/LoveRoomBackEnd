import { Request, Response, NextFunction } from 'express';
import  nodemailer  from 'nodemailer';
import { nodeModuleNameResolver } from 'typescript';
import { autenticacionController } from './autenticacionController';

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

const CorreoController = {
    async sendEmail(req: Request, res: Response){
      try {
        const code = autenticacionController.createRadmomNumber(req.body.correo);
        //console.log(process.env.EMAIL);
        //console.log(process.env.PASSWORD);
        const info = await transporter.sendMail({
          from: 'Asistencia LoveRoom prueba@gmail.com', // sender address
          to: req.body.correo, // list of receivers
          subject: "Restablecimiento de contraseña", // Subject line
          text: "El código que debes introducir para recuperar la contraseña es el siguiente: " + code.toString(), // plain text body          
          //html: "<b>Hello world?</b>", // html body
        });
        return res.send({ mensaje: "Correo enviado con exito"});
      }
      catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al enviar el correo" });
      }
        
    }
}

export { CorreoController }