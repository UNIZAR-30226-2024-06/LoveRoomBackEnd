import axios, { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import ioClient from 'socket.io-client';
import { createMatch } from '../db/match';
import { socketEvents } from '../constants/socketEvents';


// Función para conectar un cliente de socket con el token dado
const connectSocketClient = (token: string) => {
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
    });
};




test('Tres usuarios haciendo match a la vez', async () => {

    const postData1 = {
        nombre: "test1",
        correo: "test1@gmail.com",
        contrasena: "test",
        headers: {
          'Authorization': ''
        },
    };
    const postData2 = {
        nombre: "test2",
        correo: "test2@gmail.com",
        contrasena: "test",
        headers: {
          'Authorization': ''
        },
    };
    const postData3 = {
        nombre: "test3",
        correo: "test3@gmail.com",
        contrasena: "test",
        headers: {
          'Authorization': ''
        },
    };  

    try { //Creamos los usuarios
        console.log("Creando usuario test1");
        const response = await axios.post('http://localhost:5000/user/create', postData1);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('usuario');
        postData1.headers.Authorization = `Bearer ${response.data.token}`;
        console.log("Creando usuario test2");
        const response2 = await axios.post('http://localhost:5000/user/create', postData2);
        expect(response2.status).toBe(200);
        expect(response2.data).toHaveProperty('token');
        expect(response2.data).toHaveProperty('usuario');
        postData2.headers.Authorization = `Bearer ${response2.data.token}`;
        console.log("Creando usuario test3");
        const response3 = await axios.post('http://localhost:5000/user/create', postData3);
        expect(response3.status).toBe(200);
        expect(response3.data).toHaveProperty('token');
        expect(response3.data).toHaveProperty('usuario');
        postData3.headers.Authorization = `Bearer ${response3.data.token}`;

        let socket1: Socket;
        let socket2: Socket;
        let socket3: Socket;
        
        //Genereamos los tres clientes de socketio
        socket1 = await connectSocketClient(postData1.headers.Authorization);
        socket2 = await connectSocketClient(postData2.headers.Authorization);
        socket3 = await connectSocketClient(postData3.headers.Authorization);

        // El usuario test1 quiere ver el video video_prueba
        const response4 = await axios.post('http://localhost:5000/videos/watch/video_prueba', postData1);
        //El usuario test2 va a ver el mismo video
        const response5 = await axios.post('http://localhost:5000/videos/watch/video_prueba', postData2);
        //El usuario test3 va a ver el mismo video
        const response6 = await axios.post('http://localhost:5000/videos/watch/video_prueba', postData3);

        //Ahora comprobamos que el match se ha hecho entre test1 y test2
        const response7 = await axios.get('http://localhost:5000/rooms', postData1);
        console.log(response7.data);
        expect(response7.status).toBe(200);
        expect(response7.data.length).toBe(1);
        const response8 = await axios.get('http://localhost:5000/rooms', postData2);
        expect(response8.status).toBe(200);
        expect(response8.data.length).toBe(1);

        //Ahora comprobamos que no se ha hecho match entre el usuario test3 y los demas
        const response9 = await axios.get('http://localhost:5000/rooms', postData3);
        expect(response9.status).toBe(200);
        expect(response9.data.length).toBe(0);

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
        const deleteUser3 = await axios.delete('http://localhost:5000/user/delete', postData3);
        console.log(deleteUser3.data);
        console.log("Borrado test3");

        socket1.disconnect();
        socket2.disconnect();
        socket3.disconnect();

    }catch(error){
        console.log(error);
    }
},1000000);


