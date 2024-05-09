import { Request, Response, NextFunction } from 'express';
import  nodemailer  from 'nodemailer';
import { autenticacionController } from './autenticacionController';

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other port
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
  });

const CorreoController = {
    async sendEmailForgotPass(req: Request, res: Response){
      try {
        const code = autenticacionController.createRandomCode(req.body.correo);
        console.log("Codigo generado: " + code);
        //console.log(process.env.EMAIL);
        //console.log(process.env.PASSWORD);
        const info = await transporter.sendMail({
          from: 'Asistencia LoveRoom prueba@gmail.com', // sender address
          to: req.body.correo, // list of receivers
          subject: "Restablecimiento de contraseña", // Subject line
          text: "El código que debes introducir para recuperar la contraseña es el siguiente: " + code.toString(), // plain text body          
          //html: "<b>Hello world?</b>", // html body
        });
        console.log("Correo para resetear contraseña enviado con exito");
        return res.send({ mensaje: "Correo para resetear contraseña enviado con exito"});
      }
      catch (error) {
        console.log(error);
        console.log("Error al enviar el correo para resetear contraseña");
        res.status(500).json({ error: "Error al enviar el correo para resetear contraseña" });
      }
        
    }
}

export { CorreoController }