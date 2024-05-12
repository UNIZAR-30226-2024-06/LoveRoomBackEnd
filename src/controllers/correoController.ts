import { Request, Response, NextFunction } from 'express';
import  nodemailer  from 'nodemailer';
import { autenticacionController } from './autenticacionController';

/**
 * Configuracion del transporte del correo
 */
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other port
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

const CorreoController = {

    /**
     * Funcion que envia un correo con el codigo para resetear la contraseña
     */
    async sendEmailForgotPass(req: Request, res: Response){
      try {
        const code = autenticacionController.createRandomCode(req.body.correo).toString();
        console.log("Codigo generado: " + code);
        //console.log(process.env.EMAIL);
        //console.log(process.env.PASSWORD);
        const info = transporter.sendMail({
          from: 'Asistencia LoveRoom prueba@gmail.com', // sender address
          to: req.body.correo, // list of receivers
          subject: "Restablecer contraseña", // Subject line
          attachments: [
            {
              filename: 'logo_letras.jpeg',
              path: __dirname + '/../../resources/logo_letras.jpeg',
              cid: 'logo_letras'
            },
            /*
            {
              filename: 'logo_dibujo.jpeg',
              path: __dirname + '/../../resources/logo_dibujo.jpeg',
              cid: 'logo_dibujo'
            }
            */
          ],
          //text: "El código que debes introducir para recuperar la contraseña es el siguiente: " + code.toString(), // plain text body          
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">

              <style>
                  p, a, h1, h2, h3, h4, h5, h6 {font-family: 'Roboto', sans-serif !important;}
                  h1 { font-size: 25px !important; color: black; }
                  p, a { font-size: 15px !important; color: black; }

                  .codigo {
                      width: 200px;
                      height: 40px;
                      background-color: #F89F9F; 
                      color: white; 
                      border: none; 
                      border-radius: 5px;
                      cursor: pointer;
                      text-align: center; 
                      margin: auto; 
                  }

                  .container {
                      width: 100%; 
                      background-color: #FFFFFF;
                      max-width: 400px;
                      padding: 20px;
                      border: 1px solid white;
                      border-radius: 10px;
                      box-sizing: border-box;
                      margin: auto;
                      margin-top: 5%;
                      text-align: center;
                      display: flex; 
                      flex-direction: column; 
                      align-items: center; 
                      justify-content: center; 
                  }

                  .texto { font-size: 25px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div style="padding: 20px 10px 20px 10px; background-color: #FFFFFF;">
                      <div style="background-color: #FFFFFF; padding: 10px 0px 10px 0px; width: 100%; text-align: center;">
                          <img src="cid:logo_letras" alt="" style="width: 200px; height: 60px;">
                      </div>
                      <h1>Recuperacion de contraseña</h1>
                      <p>Introduce el siguiente código para recuperar tu contraseña:</p>
                      <div class="marco">
                          <div class="codigo">
                              <div class="texto">${code}</div>
                          </div>  
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
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