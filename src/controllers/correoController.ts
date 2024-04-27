import { Request, Response, NextFunction } from 'express';
import  nodemailer  from 'nodemailer';

export const correoController = {

    async sendEmail (req: Request, res: Response) {
        const { email, subject, text } = req.body;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            }
        });
    }
}


export default { correoController };