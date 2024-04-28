
import { Server } from 'socket.io';
import { socketEvents } from '../constants/socketEvents';
import { jwt } from '../index';



export default class SocketManager {
    private static instance: SocketManager;
    private io: Server | null = null;
    private users: Record<string, string> = {};
    private userRooms: Record<string, string> = {};
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
            
            // Evento que debe ser llamado por el cliente al entrar a una sala
            socket.on(socketEvents.JOIN_ROOM, (idsala: string) => {
                if (this.userRooms[userId]) {
                    // Si el usuario ya estaba en una sala, lo sacamos de ella
                    socket.leave(this.userRooms[userId]);
                    console.log(userId, ' left room ', this.userRooms[userId]);
                }
                socket.join(idsala);
                console.log(userId, ' joined room ', idsala);
                this.userRooms[userId] = idsala;
            });
            
            // Evento que debe ser llamado por el cliente al salir de una sala
            socket.on(socketEvents.LEAVE_ROOM, (idsala: string) => {
                socket.leave(idsala);
                console.log(userId, ' left room ', idsala);
                delete this.userRooms[userId];
            });
    
            socket.on(socketEvents.TIME, (senderId: string,receiverId: string,idSala: string,time: number) => {
                console.log('Time submitted', time);
                //Comprobamos el tiempo que ha enviado el cliente, si es mayor que el que tenemos guardado,
                //este se convierte en el nuevo tiempo global
                if(!this.times[idSala]){
                    this.times[idSala] = time;
                }else{
                    if(this.times[idSala] < time){
                        console.log('Nuevo tiempo marcado por el usuario ',senderId);
                        this.times[idSala] = time;
                        socket.to(this.users[receiverId]).emit(socketEvents.DECREASE_SPEED, this.times[idSala]);
                    }else if( 0 < (time / this.times[idSala]) && (time / this.times[idSala]) < 1.5){
                        console.log('El tiempo es parecido por lo que no hay que hacer nada');
                        socket.to(this.users[receiverId]).emit('do-nothing', this.times[idSala]);
                    }else if(this.times[idSala] > time){
                        console.log('No se ha cambiado el tiempo marcado por el usuario ',receiverId);
                        socket.to(this.users[receiverId]).emit(socketEvents.DECREASE_SPEED, this.times[idSala]);
                    }
                }
            });
    
            socket.on(socketEvents.PAUSE, (receiverId: string) => {
                console.log('Pause event generado, enviando a', receiverId);
                socket.to(this.users[receiverId]).emit(socketEvents.PAUSE, receiverId);
            });
    
            socket.on(socketEvents.PLAY, (receiverId: string) => {
                console.log('Play event generado, enviando a', receiverId);
                socket.to(this.users[receiverId]).emit(socketEvents.PLAY, receiverId);
            });
            
            socket.on(socketEvents.CREATE_MESSAGE, (data: any, idsala: string, callback: any) => {
                console.log('Mensaje recibido: ', data);
                // const senderId = userId;
                socket.to(idsala).emit(socketEvents.SEND_MESSAGE, data);
                callback("Mensaje enviado en la sala " + idsala);
                // const receiverId = data.receiverId;
                // if(this.users[receiverId] && this.users[senderId]){
                //     socket.to(this.users[receiverId]).emit(socketEvents.SEND_MESSAGE, data);
                //     socket.to(this.users[senderId]).emit(socketEvents.SEND_MESSAGE, data);
                // }
            });
            
            // Completar: añadir evento para cambiar video, desactivar sincronización y ¿borrar sala?

            socket.on('disconnect', () => {
                // Completar: borrar entrada de videoViewer
                console.log('User disconnected');
                delete this.users[userId];
            });
        });
    
    }

    public emitMatch(senderId: string, receiverId: string, idSala: string, idVideo: string) {
        if(this.io){
            this.io.to(this.users[receiverId]).emit(socketEvents.MATCH, 
                senderId,
                receiverId,
                idSala,
                idVideo
            );
            console.log('Match sent by id: ', senderId, ' to id: ', receiverId);
        }
    }
}

