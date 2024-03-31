import http from 'http';
import ioClient from 'socket.io-client';
import { SalaController } from '../controllers/salaController';
import { getUsuariosViendoVideo } from '../db/video';
import  SocketManager  from '../services/socketManager'; // Importamos la clase en lugar de la instancia



test('one connection from a client', () => {
  const client = ioClient('http://localhost:5000');
  client.on('connect', () => {
    expect(client.connected).toBeTruthy();
    client.disconnect();
  });
});

test('two connections, one makes match with another', () => {
  const client1 = ioClient('http://localhost:5000');
  const client2 = ioClient('http://localhost:5000');
  client1.on('connect', () => {
    client2.on('connect', () => {
      expect(client1.connected).toBeTruthy();
      expect(client2.connected).toBeTruthy();
      //Cliente 1 quiere ver el video 1
      SalaController.verVideo('1', '1');
      expect(getUsuariosViendoVideo('1')).resolves.toEqual([{idusuario: '1'}]);
      
      client1.emit('match', {senderId: '1', receiverId: '2', idVideo: '1'});
      client1.disconnect();
      client2.disconnect();
    });
  });
});