import { Request, Response, NextFunction } from 'express';
import { jwt } from '../index';
import { getUserById } from '../db/usuarios';

const secret = process.env.SECRET

class autenticacionController {
    public static async comprobarAutenticacion(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            req.body.id = payload.id;
            console.log(payload);
            next();
        } 
        catch (error) {
            res.status(401).json({ error: 'No estas autenticado' });
        }

    }

    public static async crearToken(req: Request, res: Response) : Promise<void> {
        const token = jwt.sign({
            id: req.body.id,
            exp: Date.now() + 60 * 60 * 1000 * 24 * 3   // 1 dia
        }, secret)
        console.log(token);
        res.status(200).send({token: token});
    }

    public static getPayload(req: Request) : any {
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader?.split(' ')[1];
        const payload = jwt.verify(token, secret);
        return payload;
    }

    public static async checkToken(req: Request, res: Response) : Promise<void> {
        try {
            const payload = autenticacionController.getPayload(req);
            const user = getUserById(payload.id);
            if (Date.now() > payload.exp || !user) {
                res.status(401).json({ valido: false });
                return;
            }
            else {
                res.status(200).json({ valido: true });
            }
        }
        catch (error) {
            res.status(401).json({ valido: false });
        }
        
    }
}

export { autenticacionController };