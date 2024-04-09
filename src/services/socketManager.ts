import { Server } from 'socket.io';
import { autenticacionController } from '../controllers/autenticacionController';
import { createMatch } from '../db/match';
import { socketEvents } from '../constants/socketEvents';
import { jwt } from '../index';



export default class SocketManager {
    private static instance: SocketManager;
    private io: Server | null = null;
    private users: Record<string, string> = {};
    private times: Record<string, number> = {};
    private secret = process.env.SECRET

    private constructor() {
        
    }

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
          SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public async initSocketServer(httpServer : any) : Promise<void>  {
        this.io = new Server(httpServer);
        console.log('Socket server started');
    
        this.io.use((socket: any, next) => {
            console.log('Middleware');
            const token = socket.handshake.auth.token;
            console.log('Token', token);
            if (!token) {
                return next(new Error('Authentication error'));
            }
            try {
                
                const payload = jwt.verify(token.split(' ')[1], this.secret);
                console.log('Usuario correctamente autenticado',payload.id);
                socket.authUser = payload.id;
                next();
        
            }catch(error){
                console.error('Error en la autenticación', error);
                next(new Error('Authentication error'));
            }

        });
        
        this.io.on('connection', (socket : any) => {
            console.log('Socket connection. socket.connected: ', socket.connected);
            const userId = socket.authUser;
            //Añadimos al usuario a la lista de usuarios conectados 
            if(!this.users[userId]){
                this.users[userId] = socket.id;
            }
    
            socket.on(socketEvents.TIME, (senderId: string,receiverId: string,idSala: string,time: number) => {
                console.log('Time submitted', time);
                //Comprobamos el tiempo que ha enviado el cliente, si es mayor que el que tenemos guardado,
                //este se convierte en el nuevo tiempo global
                if(this.times[idSala] < time){
                    this.times[idSala] = time;
                    socket.to(this.users[receiverId]).emit(socketEvents.DECREASE_SPEED, this.times[idSala]);
                }else if(this.times[idSala] > time){
                    socket.to(this.users[senderId]).emit(socketEvents.INCREASE_SPEED, this.times[idSala]);
                }
            });
    
            socket.on(socketEvents.PAUSE, (receiverId: string) => {
                console.log('Pause event');
                socket.to(this.users[receiverId]).emit(socketEvents.PAUSE);
            });
    
            socket.on(socketEvents.PLAY, (receiverId: string) => {
                console.log('Play event');
                socket.to(this.users[receiverId]).emit(socketEvents.PLAY);
            });
    
    
            socket.on('disconnect', () => {
                console.log('User disconnected');
                delete this.users[userId];
            });
        });
    
    }

    public emitMatch(senderId: string, receiverId: string,idVideo: string){
        console.log('Match sent',senderId ,receiverId);
        if(this.io){
            this.io.to(this.users[receiverId]).emit(socketEvents.MATCH, {
                senderId,
                receiverId,
                idVideo
            });
        }
        
    }

}


/*function getCookie(cookie, name) {
    cookie = ';' + cookie;
    cookie = cookie.split('; ').join(';');
    cookie = cookie.split(' =').join('=');
    cookie = cookie.split(';' + name + '=');
    if (cookie.length < 2) {
      return null;
    } else {
      return decodeURIComponent(cookie[1].split(';')[0]);
    }
}*/

/*setInterval(async () => {
    const currentUsers = await prisma.usuario.findMany();
    currentUsers.forEach(async (u) => {
      if (!users[u.id.toString()]) {
        // TODO - Make user online
      }
    });
  }, 5 * 60 * 1000);*/
