import { Request, Response, NextFunction } from 'express';
import  nodemailer  from 'nodemailer';
import { nodeModuleNameResolver } from 'typescript';

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
        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
            to: req.body.correo, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
    }
}

export { CorreoController }