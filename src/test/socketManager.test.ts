import http from 'http';
import ioClient from 'socket.io-client';
import  SalaController  from '../controllers/salaController';
import { getUsuariosViendoVideo } from '../db/video';
import { getMatchesUsuario } from '../db/match';
import  SocketManager  from '../services/socketManager'; // Importamos la clase en lugar de la instancia



test('one connection from a client',async () => {
  const client = ioClient('http://localhost:5000');
  client.on('connect', async() => {
    expect(client.connected).toBeTruthy();
    client.disconnect();
  });
});

test('two connections, one makes match with another',async () => {
  const client1 = ioClient('http://localhost:5000');
  const client2 = ioClient('http://localhost:5000');
  client1.on('connect', async () => {
    client2.on('connect', async () => {
      expect(client1.connected).toBeTruthy();
      expect(client2.connected).toBeTruthy();
      //Cliente 1 quiere ver el video 1
      await SalaController.verVideo('1', '1');
      await expect(getUsuariosViendoVideo('1')).resolves.toEqual([{idusuario: '1'}]);
      //Cliente 2 quiere ver el video 1
      await SalaController.verVideo('2', '1');
      await expect(getMatchesUsuario('1')).resolves.toEqual([{idusuario1: '1', idusuario2: '2'}]);
      client1.emit('match', {senderId: '1', receiverId: '2', idVideo: '1'});
      client1.disconnect();
      client2.disconnect();
    });
  });
});