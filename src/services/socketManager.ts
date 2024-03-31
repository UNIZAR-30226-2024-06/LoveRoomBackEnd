import { Server } from 'socket.io';
import { deleteSalaUnitaria } from '../db/salas';

export default class SocketManager {
    private static instance: SocketManager;
    private io: Server | null = null;
    private users: Record<string, string> = {};
    private times: Record<string, number> = {};

    private constructor() {
        
    }

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
          SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public initSocketServer(httpServer : any) : void  {
        const io = new Server(httpServer);
        console.log('Socket server started');
    
        /*io.use((socket: any, next) => {
            console.log('Middleware');
            //TODO -- Middleware to check if user is authenticated
            socket.authUser = null;
        });*/
        
        io.on('connection', (socket : any) => {
            console.log('Socket connection. socket.connected: ', socket.connected);
            const userId = socket.authUser;
            //Añadimos al usuario a la lista de usuarios conectados 
            if(!this.users[userId]){
                this.users[userId] = socket.id;
            }
    
            socket.on('match', ({senderId, receiverId, idVideo}: {senderId: string, receiverId: string, idVideo: string}) => {
                console.log('Match recibido', senderId, receiverId);
                deleteSalaUnitaria(receiverId,idVideo);
            });
    
            socket.on('submitTime', (senderId: string,receiverId: string,idSala: string,time: number) => {
                console.log('Time submitted', time);
                //Comprobamos el tiempo que ha enviado el cliente, si es mayor que el que tenemos guardado,
                //este se convierte en el nuevo tiempo global
                if(this.times[idSala] < time){
                    this.times[idSala] = time;
                    socket.to(this.users[receiverId]).emit('decrease-speed', this.times[idSala]);
                }else if(this.times[idSala] > time){
                    socket.to(this.users[senderId]).emit('increase-speed', this.times[idSala]);
                }
            });
    
            socket.on('pause-event', (receiverId: string) => {
                console.log('Pause event');
                socket.to(this.users[receiverId]).emit('pause-video');
            });
    
            socket.on('play-event', (receiverId: string) => {
                console.log('Play event');
                socket.to(this.users[receiverId]).emit('play-video');
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
            this.io.to(this.users[receiverId]).emit('match', {
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
