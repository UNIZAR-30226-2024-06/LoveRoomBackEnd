import { prisma } from '../index';
import { Request, Response, NextFunction } from 'express';
import { jwt } from '../index';

const secret = process.env.SECRET

class autenticacionController {
    static async comprobarAutenticacion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) {
                res.status(401).json({ error: 'No estas autenticado' });
                return;
            }
            const payload = autenticacionController.getPayload(req);
            if (Date.now() > payload.exp) {
                res.status(401).json({ error: 'Token expirado' });
                return;
            }
            next();
        } 
        catch (error) {
            res.status(401).json({ error: 'No estas autenticado' });
        }

    }

    static async crearToken(req: Request, res: Response) : Promise<void> {
        const token = jwt.sign({
            id: req.body.id,
            exp: Date.now() + 60 * 60 * 1000 * 24   // 1 dia
        }, secret)
        console.log(token);
        res.status(200).send({token: token})

    }

    static getPayload(req: Request) : any {
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader?.split(' ')[1];
        const payload = jwt.verify(token, secret);
        return payload;
    }

}

export { autenticacionController };