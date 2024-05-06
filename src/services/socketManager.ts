
import { Server } from 'socket.io';
import { socketEvents } from '../constants/socketEvents';
import { jwt } from '../index';
import { changeVideoSala, setEstadoSala, deleteSalaUnitariaAtomic, cambiarVideoUnitaria, getInfoSala } from '../db/salas';
import { createMensaje } from '../db/mensajes';
import { info } from 'console';

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
            //console.log('Middleware');
            const token = socket.handshake.auth.token;
            //console.log('Token', token);
            if (!token) {
                return next(new Error('Authentication error'));
            }
            try {
                
                const payload = jwt.verify(token.split(' ')[1], this.secret);
                console.log('Usuario correctamente autenticado en socket ',payload.id);
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
            
            // Evento para avisar al usuario que debe emitir un JOIN_ROOM al reconectarse a una sala. Sirve para mantener la conexion
            // a la sala cuando un usuario se desconecta y reconecta automaticamente al socket (p.ej. salir y volver a entrar a la app)
            // Los usuarios dentro de una sala unitaria no necesitan emitir un JOIN_ROOM al recibir este evento
            console.log('Emitiendo check room');
            socket.emit(socketEvents.CHECK_ROOM);

            // Evento que debe ser llamado por el cliente al entrar a una sala (no unitaria)
            socket.on(socketEvents.JOIN_ROOM, (idsala: string) => {
                if (idsala === null || idsala === '') {
                    console.error('Error: idSala is null or empty');
                    return;
                }
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
            
            // Evento para pausar el video en una sala
            socket.on(socketEvents.PAUSE, (idsala: string, callback : (success: boolean) => void) => {
                try {
                    console.log('Pause event generado en sala ', idsala, ' por usuario ', userId);
                    socket.to(idsala).emit(socketEvents.PAUSE);
                    callback(true);
                } catch (error) {
                    console.error('Error al pausar el video en sala ' + idsala + ' por usuario ' + userId + ': ' + error);
                    callback(false);
                }
            });
    
            // Evento para reproducir el video en una sala
            socket.on(socketEvents.PLAY, (idsala: string, callback : (success: boolean) => void) => {
                try {
                    console.log('Play event generado en sala ', idsala, ' por usuario ', userId);
                    socket.to(idsala).emit(socketEvents.PLAY);
                    callback(true);
                } catch (error) {
                    console.error('Error al reproducir el video en sala ' + idsala + ' por usuario ' + userId + ': ' + error);
                    callback(false);
                }
            });
            
            // Evento para enviar un mensaje en una sala. (Nota: rutaMultimedia debe ser el path a una imagen ya subida al servidor?)
            socket.on(socketEvents.CREATE_MESSAGE, async (idsala: string, texto: string, rutamultimedia: string, 
                callback: (sucess: boolean, timestamp: Date | null) => void) => {
                try {
                    console.log('Socket create message: ', texto, ' in room ', idsala);
                    const senderID = userId.toString();
                    socket.to(idsala).emit(socketEvents.RECEIVE_MESSAGE, senderID, texto, rutamultimedia);

                    const fechaHora = new Date();
                    // Ajustamos manualmente a la zona horaria de España (UTC+2)
                    fechaHora.setHours(fechaHora.getHours() + 2);
                    
                    // Notificamos al cliente que el mensaje ha sido enviado
                    callback(true, fechaHora);

                    // Guardamos el mensaje en la BD
                    await createMensaje(senderID, idsala, texto, rutamultimedia, fechaHora);
                } catch (error) {
                    console.error('Error al enviar mensaje en la sala ' + idsala + ': ' + error);
                    // Notificamos el error al cliente
                    callback(false, null);
                }
            });

            // Evento para cambiar el video de una sala (no unitaria)
            socket.on(socketEvents.CHANGE_VIDEO, async (idSala: string, idVideo: string, callback: (success: boolean) => void) => {
                try {
                    console.log('Cambio de video en sala ', idSala, ' a video ', idVideo);
                    socket.to(idSala).emit(socketEvents.CHANGE_VIDEO, idVideo);
                    if (callback) {
                        callback(true);
                    }
                    // Actualizamos la tabla sala de la BD con el nuevo video
                    await changeVideoSala(idSala, idVideo);
                } catch (error) {
                    console.error('Error al cambiar el video en la sala ' + idSala + ' a video ' + idVideo + ': ' + error);
                    // Llamamos al callback con un mensaje de error
                    if (callback) {
                        callback(false);
                    }
                }
            });

            // Evento para cambiar el video de una sala unitaria (equivalente a llamar a /videos/watch/:idVideo)
            socket.on(socketEvents.CHANGE_VIDEO_UNITARIA, async (idVideo: string, callback: (success: boolean, response: any) => void) => {
                try {
                    console.log('Cambio de video en sala unitaria a video ', idVideo);
                    // Cambiamos el video en la sala unitaria
                    const formattedResponse = await cambiarVideoUnitaria(userId.toString(), idVideo);
                    console.log('formattedResponse: \n', formattedResponse);
                    // Llamamos al callback con la respuesta formateada (equivalente a llamar a /videos/watch/:idVideo)
                    callback(true, formattedResponse);
                } catch (error) {
                    console.error('Error al cambiar el video en la sala unitaria a video ' + idVideo + ': ' + error);
                    // Llamamos al callback con un mensaje de error
                    callback(false, null);
                }
            });

            // Evento para solicitar que me manden la informacion de sincronizacion de la sala (me mandarán un SYNC_ON)
            // Hay que llamar a este evento al entrar a una sala sincronizada
            socket.on(socketEvents.GET_SYNC, async (idSala: string) => {
                try {
                    console.log('Get sync event in room ', idSala, ' by user ', userId);
                    if (idSala === null || idSala === '') {
                        console.error('Get Sync Error: idSala is null or empty by user ', userId);
                        return;
                    } else {
                        // Comprobamos si el otro usuario de la sala esta conectado
                        if (this.io) {
                            const socketsInRoom = this.io.sockets.adapter.rooms.get(idSala);
                            if (socketsInRoom && socketsInRoom.size > 1) {
                                console.log('El otro usuario esta conectado a la sala, enviando GET_SYNC');
                                // Soliciamos la sincronizacion al otro usuario mediante el evento GET_SYNC
                                socket.to(idSala).emit(socketEvents.GET_SYNC);
                            } else {
                                console.log('El otro usuario NO esta conectado a la sala.');
                                // Si no esta conectado, obtenemos la informacion de la sala de la BD y la enviamos al usuario
                                const infoSala = await getInfoSala(idSala);
                                if (infoSala) {
                                    console.log('Mandando infoSala de la BD: ', infoSala);
                                    if (infoSala.estado === 'sincronizada') {
                                        socket.emit(socketEvents.SYNC_ON, infoSala.idvideo, infoSala.tiemposegundos, false); // pausado = false por defecto
                                    } else {
                                        console.log('La sala no esta sincronizada, enviando SYNC_OFF');
                                        socket.emit(socketEvents.SYNC_OFF);
                                    }
                                } else {
                                    console.error('Error al obtener la información de la sala de la BD en GET_SYNC');
                                    socket.emit(socketEvents.SYNC_OFF);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al solicitar GET_SYNC en la sala ' + idSala + ': ' + error);
                }
            });

            // Evento para desactivar la sincronizacion de una sala
            socket.on(socketEvents.SYNC_OFF, async (idSala: string, callback: (success: boolean) => void) => {
                try {
                    console.log('Desactivando sincronización en sala ', idSala);
                    socket.to(idSala).emit(socketEvents.SYNC_OFF);
                    callback(true);
                    // Actualizamos la tabla sala de la BD apaganado la sincronizacion
                    await setEstadoSala(idSala, 'no_sincronizada');
                } catch (error) {
                    console.error('Error al desactivar la sincronización en la sala ' + idSala + ': ' + error);
                    callback(false);
                }
            });

            // Evento para sincronizar una sala. Sirve tanto para sincronizar al activar la sincronizacion cuando
            // estaba desactivada, como para sincronizar el vídeo al entrar a una sala sincronizada.
            socket.on(socketEvents.SYNC_ON, async (idSala: string, idVideo: string, timesegundos: Number, pausado: boolean) => {
                try {
                    if (idSala === null || idSala === '' || idVideo === null) {
                        console.error('SYNC_ON Error: idSala or idVideo is null or empty by user ', userId);
                        return;
                    }
                    console.log('SYNC_ON event in room ', idSala, ' with video ', idVideo, ' at time ', timesegundos, ' paused: ', pausado, ' by user ', userId);
                    socket.to(idSala).emit(socketEvents.SYNC_ON, idVideo, timesegundos, pausado);
                    // Actualizamos la tabla sala de la BD encendiendo la sincronizacion y actualizando el video y el tiempo
                    // COMPLETAR
                    await setEstadoSala(idSala, 'sincronizada');
                } catch (error) {
                    console.error('Error en SYNC_ON en la sala ' + idSala + ': ' + error);
                }
            });

            socket.on('disconnect', async () => {
                console.log('User disconnected');
                delete this.users[userId];  // Borramos al usuario de la lista de usuarios conectados

                // Borramos la entrada de videoViewer si el usuario estaba en una sala unitaria
                if (!this.userRooms[userId]) {  // Si el usuario no estaba en una sala comun
                    console.log('Borrando sala unitaria');
                    await deleteSalaUnitariaAtomic(userId);
                } else {    // Si estaba en una sala, marcamos que se ha desconectado de ella
                    console.log('User ', userId, ' left room ', this.userRooms[userId]);
                    delete this.userRooms[userId]; // Completar: se podria no borrarla y al reconectar volver a hacer join a la sala
                }
            });

            // Completar: añadir evento para ¿borrar sala (unmatch)? cambiar nombre sala?

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

