import { Request, Response, NextFunction } from 'express';
import { jwt } from '../index';
import { getUserById } from '../db/usuarios';

// Es la clave secreta para firmar el token
const secret = process.env.SECRET

const autenticacionController = {
    
    VectorCode: new Map(),

    /**
     * Comprueba si el usuario esta autenticado.
     * El usuario esta autenticado si tiene un token valido.
     * El token es valido si no ha expirado,el usuario no ha sido baneado.
     * El token es no valido si ha expirado o el usuario ha sido baneado.
     */
    async checkAuthUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            //console.log("Comprobando autenticacion");
            const authorizationHeader = req.headers.authorization;
            //console.log(authorizationHeader);
            // Comprobar si hay token
            if (!authorizationHeader) { // No hay token, no tiene autorizacion
                res.status(401).json({ error: 'No estas autenticado, introduce token' });
                return;
            }
            const payload = autenticacionController.getPayload(req);
            
            // Comprobar si el token ha expirado
            if (Date.now() > payload.exp) {
                res.status(401).json({ error: 'Token expirado' });
                return;
            }
            const user = await getUserById(payload.id);
            // Comprobar si el usaurio ha sido eliminado
            if (user == null) {
                res.status(404).json({ error: 'El usuario ha sido eliminado' });
                return;
            }

            // Comprobar si el usuario ha sido baneado
            if (user != null && user.baneado) {
                res.status(403).json({ error: 'El usuario está baneado' });
                return;
            }
            //console.log(payload);
            console.log("Usuario autenticado");
            req.body.idUser = payload.id;
            next();
        } 
        catch (error) {
            res.status(401).json({ error: 'No estas autenticado' });
        }

    },

    /**
     * Crea un token con el id del usuario.
     * El token expira en 3 dias.
     */
    async crearToken(req: Request, res: Response) : Promise<void> {
        const user = await getUserById(req.body.id);
        const token = jwt.sign({
            id: req.body.id,
            correo: req.body.correo,
            exp: Date.now() + 60 * 60 * 1000 * 24 * 3   // 3 dia
        }, secret, { algorithm: 'HS512' })
        console.log(token);
        res.status(200).send({token: token, usuario: user});
    },

    /**
     * Obtiene el payload del token.
     * El token debe ser enviado en el header de la peticion con la clave
     * Devuelve el payload del token.
     */
    getPayload(req: Request) : any {
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader?.split(' ')[1];
        const payload = jwt.verify(token, secret);
        return payload;
    },
    
    /**
     * Comprueba si el token es valido.
     * El token es valido si no ha expirado,el usuario no ha sido baneado.
     * El token es no valido si ha expirado o el usuario ha sido baneado  o no existe.
     * El token debe ser enviado en el header de la peticion con la clave
     */
    async checkToken(req: Request, res: Response) : Promise<void> {
        try {
            const payload = autenticacionController.getPayload(req);
            const usuario = await getUserById(payload.id);
            if (Date.now() > payload.exp || !usuario || usuario.baneado || !payload) {
                res.status(401).json({ valido: false });
                return;
            }
            else {
                res.status(200).json({ valido: true, usuario});
            }
        }
        catch (error) {
            res.status(401).json({ valido: false });
        }
    },

    /**
     * Comprueba si el usuario es administrador.
     * El usuario es administrador si su tipousuario es "administrador".
     * El usuario debe estar autenticado.
     */
    async checkAdmin(req: Request, res: Response, next: NextFunction) : Promise<void> {
        console.log("Comprobando si es admin");
        try {
            const id = req.body.idUser
            const user = await getUserById(id);
            if (user && user.tipousuario == "administrador") {
                console.log("Es admin");
                next();
            }
            else {
                res.status(401).json({ error: 'No tienes permisos de administrador' });
            }
        }
        catch (error) {
            res.status(401).json({ error: 'No estas autenticado' });
        }
    },

    /** 
     * Devuelve un codigo aleatorio de 6 caracteres y lo guarda en un vector con el correo.
     * El codigo creado es el utilizado para recuperar la contraseña.
     */
    createRandomCode(correo: String): String{
        //const code = Math.floor(Math.random() * 1000000);
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        const numberCharacters = 6;
        for (let i = 0; i < numberCharacters; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            code += caracteres.charAt(indice);
        }
        this.VectorCode.set(correo, code);
        return code.toString();
    },


    /**
     * Comprueba si el codigo introducido es valido
     * El codigo es valido si es igual al codigo guardado en el vector con el correo.
     * El codigo es no valido si no es igual al codigo guardado en el vector con el correo.
     */
    validCode(email: string, code: string): boolean {
        try {
            const codeVector = this.VectorCode.get(email);
            if (codeVector == code) {
                return true;
            } else {
                return false
            }
        } catch (error) {
            return false
        }
    },

    /**
     * Compreuba si el codigo introducido es valido.
     * Devuelve true si es valido
     * Devuelve false si no es valido
     */
    async checkCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (this.validCode(req.body.correo, req.body.codigo) && req.body.codigo != "") {
                res.status(200).json({ valido: true });
            } 
            else {
                res.status(401).json({ error: "El codigo introducido no es correcto", valido: false });
            }
        } catch (error) {
            res.status(500).json({ error: "Error al verificar el codigo", valido: false });
        }
    },

    /**
     * Middleware que comprueba si el codigo introducido es valido.
     * Si es valido continua con la siguiente funcion.
     * Si no es valido devuelve un error 401.
     */
    async checkCodeMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (this.validCode(req.body.correo, req.body.codigo)) {
                next();
            } 
            else {
                res.status(401).json({ error: "Codigo introducido no es correcto" });
            }
        } catch (error) {
            res.status(500).json({ error: "Error al verificar el código" });
        }
    }
    
      
}

export { autenticacionController };