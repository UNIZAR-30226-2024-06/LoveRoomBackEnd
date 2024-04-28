
import { Server } from 'socket.io';
import { socketEvents } from '../constants/socketEvents';
import { jwt } from '../index';
import { changeVideoSala, setEstadoSala } from '../db/salas';
import { createMensaje } from '../db/mensajes';

export default class SocketManager {
    private static instance: SocketManager;
    private io: Server | null = null;
    private users: Record<string, string> = {}; // userId -> socketId
    private userRooms: Record<string, string> = {}; // userId -> roomId
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
                if (this.userRooms[userId] && this.userRooms[userId] !== idsala) {
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
            
            // Evento para enviar un mensaje en una sala. (Nota: rutaMultimedia debe ser el path a una imagen ya subida al servidor?)
            socket.on(socketEvents.CREATE_MESSAGE, async (idsala: string, texto: string, rutamultimedia: string, callback: any) => {
                try {
                    console.log('Socket create message: ', texto, ' in room ', idsala);
                    const senderID = userId.toString();
                    socket.to(idsala).emit(socketEvents.RECEIVE_MESSAGE, senderID, texto, rutamultimedia);
                    callback("Mensaje enviado en la sala " + idsala);

                    // Guardamos el mensaje en la BD
                    await createMensaje(senderID, idsala, texto, rutamultimedia);
                } catch (error) {
                    console.error('Error al enviar mensaje en la sala ' + idsala + ': ' + error);
                    // Llamamos al callback con un mensaje de error
                    callback("Error al enviar mensaje en la sala " + idsala);
                }
            });

            // Evento para cambiar el video de una sala
            socket.on(socketEvents.CHANGE_VIDEO, async (idSala: string, idVideo: string, callback: (message: string) => void) => {
                try {
                    console.log('Cambio de video en sala ', idSala, ' a video ', idVideo);
                    socket.to(idSala).emit(socketEvents.CHANGE_VIDEO, idVideo);
                    if (callback) {
                        callback("Video cambiado en la sala " + idSala + " a video " + idVideo);
                    }
                    // Actualizamos la tabla sala de la BD con el nuevo video
                    await changeVideoSala(idSala, idVideo);
                } catch (error) {
                    console.error('Error al cambiar el video en la sala ' + idSala + ' a video ' + idVideo + ': ' + error);
                    // Llamamos al callback con un mensaje de error
                    if (callback) {
                        callback("Error al cambiar el video en la sala " + idSala + " a video " + idVideo);
                    }
                }
            });

            // Evento para desactivar la sincronizacion de una sala
            socket.on(socketEvents.SYNC_OFF, async (idSala: string) => {
                try {
                    console.log('Desactivando sincronización en sala ', idSala);
                    socket.to(idSala).emit(socketEvents.SYNC_OFF);
                    // Actualizamos la tabla sala de la BD apaganado la sincronizacion
                    await setEstadoSala(idSala, 'no_sincronizada');
                } catch (error) {
                    console.error('Error al desactivar la sincronización en la sala ' + idSala + ': ' + error);
                }
            });

            // Evento para activar la sincronizacion de una sala
            socket.on(socketEvents.SYNC_ON, async (idSala: string) => {
                try {
                    console.log('Activando sincronización en sala ', idSala);
                    socket.to(idSala).emit(socketEvents.SYNC_ON);
                    // Actualizamos la tabla sala de la BD encendiendo la sincronizacion
                    await setEstadoSala(idSala, 'sincronizada');
                } catch (error) {
                    console.error('Error al activar la sincronización en la sala ' + idSala + ': ' + error);
                }
            });

            socket.on('disconnect', () => {
                // Completar: borrar entrada de videoViewer
                console.log('User disconnected');
                delete this.users[userId];
                delete this.userRooms[userId]; // Completar: se podria no borrarla y al reconectar volver a hacer join a la sala
            });

            // Completar: añadir evento para ¿borrar sala? cambiar nombre sala?

            // Completar: Si el usuario ya estaba en una sala, lo volvemos a unir? Daria problemas (en salas unitarias)
            // pero solucionaria otros como apagar y encender el movil y seguir estando en la sala
            // if (this.userRooms[userId]) {
            //     socket.join(this.userRooms[userId]);
            //     console.log(userId, ' re-joined room ', this.userRooms[userId]);
            // }
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
            console.log('Match sent by id: ', senderId, ' to id: ', receiverId, ' in room: ', idSala, ' with video: ', idVideo);
        }
    }
}

