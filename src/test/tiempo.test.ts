import axios, { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import ioClient from 'socket.io-client';
import { socketEvents } from '../constants/socketEvents';


// Función para conectar un cliente de socket con el token dado
const connectSocketClient = (token: string,iduser : string) => {
    return new Promise<Socket>((resolve, reject) => {
        const socket = ioClient('http://localhost:5000', { auth: { token } });
        socket.on('connect', () => {
            console.log('Socket connected');
            resolve(socket);
        });
        socket.on(socketEvents.MATCH, (senderId: string, receiverId: string, idVideo: string) => {
            console.log('Match recibido', senderId, receiverId);
        });
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            reject(error);
        });
        socket.on(socketEvents.PAUSE, (receiverId: string) => {
            console.log('Evento recibido',receiverId);
            console.log('Pause');
        });
        socket.on(socketEvents.PLAY, (receiverId: string) => {
            console.log('Evento recibido',receiverId);
            console.log('Play');
        });
    });
};

const emitTime = (socket: Socket, senderId: string, receiverId: string,idSala: string, time: number) => {
    socket.emit(socketEvents.TIME, senderId, receiverId,idSala, time);
};

const emitPause = (socket: Socket, receiverId: string) => {
    socket.emit(socketEvents.PAUSE, receiverId);
}

const emitPlay = (socket: Socket, receiverId: string) => {
    socket.emit(socketEvents.PLAY, receiverId);
}




test('Comprobacion de envio de tiempos', async () => {

    const postData1 = {
        nombre: "test7",
        correo: "test22@gmail.com",
        contrasena: "test",
        headers: {
          'Authorization': ''
        },
    };
    const postData2 = {
        nombre: "test6",
        correo: "test23@gmail.com",
        contrasena: "test",
        headers: {
          'Authorization': ''
        },
    }; 

    try { //Creamos los usuarios
        console.log("Creando usuario test5");
        const response = await axios.post('http://localhost:5000/user/create', postData1);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('usuario');
        postData1.headers.Authorization = `Bearer ${response.data.token}`;
        console.log("Creando usuario test6");
        const response2 = await axios.post('http://localhost:5000/user/create', postData2);
        expect(response2.status).toBe(200);
        expect(response2.data).toHaveProperty('token');
        expect(response2.data).toHaveProperty('usuario');
        postData2.headers.Authorization = `Bearer ${response2.data.token}`;
        

        let socket1: Socket;
        let socket2: Socket;
        
        
        //Genereamos los tres clientes de socketio
        socket1 = await connectSocketClient(postData1.headers.Authorization,response.data.idusuario);
        socket2 = await connectSocketClient(postData2.headers.Authorization,response.data.idusuario);
        

        // El usuario test1 quiere ver el video video_prueba
        const response4 = await axios.post('http://localhost:5000/videos/watch/video_prueba', postData1);
        //El usuario test2 va a ver el mismo video
        const response5 = await axios.post('http://localhost:5000/videos/watch/video_prueba', postData2);
        console.log(response5.data);
        

        //Ahora comprobamos que el match se ha hecho entre test1 y test2
        const response7 = await axios.get('http://localhost:5000/rooms', postData1);
        console.log(response7.data);
        console.log(response7.data.length);
        console.log(response7.status);
        expect(response7.status).toBe(200);
        expect(response7.data.length).toBe(1);
        const response8 = await axios.get('http://localhost:5000/rooms', postData2);
        console.log(response8.data);
        console.log(response8.data.length);
        console.log(response8.status);
        expect(response8.status).toBe(200);
        expect(response8.data.length).toBe(1);
        const idsala = response5.data.id;

        //Ahora simulamos los envios de tiempo al servidor por parte de los dos usuarios
        for(let i = 0; i < 10; i++){
            if(i % 2 == 0){
                emitTime(socket1, response5.data.idusuario,  response2.data.usuario.id,idsala ,i);
            }else{
                emitTime(socket2, response2.data.usuario.id, response5.data.idusuario,idsala ,i);
            }
            
        }

        //Ahora simulamos que el usuario test1 pausa el video
        console.log("Pausando video",response5.data.idusuario);
        emitPause(socket1, response2.data.usuario.id);
        //Ahora simulamos que el usuario test2 activa el video
        console.log("Activando video", response2.data.usuario.id);
        emitPlay(socket2, response5.data.idusuario);
        //Simulamos que el usuario test2 para el video
        console.log("Pausando video", response2.data.usuario.id);
        emitPause(socket2, response5.data.idusuario);
        //Simulamos que el usuario test1 activa el video
        console.log("Activando video",response5.data.idusuario);
        emitPause(socket1, response2.data.usuario.id);

        

        //Ahora borramos la sala de test1 y test2
        const response10 = await axios.delete('http://localhost:5000/rooms/'+response7.data[0].id, postData1);
        expect(response10.status).toBe(200);

        //Ahora los borramos los usuarios
        const deleteUser1 = await axios.delete('http://localhost:5000/user/delete', postData1);
        console.log("Borrado test1");
        console.log(deleteUser1.data);
        const deleteUser2 = await axios.delete('http://localhost:5000/user/delete', postData2);
        console.log("Borrado test2");
        console.log(deleteUser2.data);
    

        socket1.disconnect();
        socket2.disconnect();
        

    }catch(error){
        console.log(error);
    }
},1000000);


