import { Server, Socket } from "socket.io";
import {prisma} from '../index';
import { SalaController } from './salaController';

class SocketManager {
private io: Server;
private socketId: string;
private static instance: SocketManager;

private constructor(io: Server) {
    this.io = io;
    this.socketId = "";
    console.log("Inicializando SocketManager");
    this.io.on('connection', (socket: Socket) => {
        socket.join('bigRoom');
        this.socketId = socket.id;
        console.log(`Usuario conectado: ${socket.id}`);
        
        socket.on('disconnect', () => {
            console.log(`Usuario desconectado: ${socket.id}`);
        });

        socket.on('match', (correoUsuario: string, idSala: number,urlvideo: string) => {
            console.log(`Match con usuario: ${correoUsuario}`);
            if (this.isSocketConnected(this.socketId)) {
                let socket = this.io.sockets.sockets.get(this.socketId);
                if (socket) {
                    socket.join(idSala.toString());
                    socket.leave('bigRoom');
                    console.log(`Conectando a sala: ${idSala}, desconectando de sala central`);
                    //En caso de que el usuario este en una salaUnitaria se borra la entrada de la BD
                    const result = SalaController.borrarSalaUnitaria(urlvideo, correoUsuario);
                    
                }
            }else{
                console.log("Usuario no conectado");
            }
        
        });

        });
    }

    public static getInstance(io: Server): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(io);
        }

        return SocketManager.instance;
    }

    public emitMatchBigRoom(usuarioMatch: string, salaAConectar : number, urlvideo: string): void {
        this.io.to('bigRoom').emit('match', usuarioMatch, salaAConectar, urlvideo);
        console.log("Emitiendo match #{usuarioMatch} en sala #{salaAConectar}");
    }

    public recconectToBigRoom(salaADesconectar: string): void {
        if (this.isSocketConnected(this.socketId)) {
            let socket = this.io.sockets.sockets.get(this.socketId);
            if (socket) {
                socket.join('bigRoom');
                console.log("Conectando a sala central, desconectando de sala: #{salaADesconectar}")
                socket.leave(salaADesconectar);
            }
        }

    }

    public emitToJoinSala(sala: string,correoUsuario: string): void {
        console.log("")
    }

    private isSocketConnected(socketId: string): boolean {
        return this.io.sockets.sockets.get(socketId) !== undefined;
    }
}

export default SocketManager;