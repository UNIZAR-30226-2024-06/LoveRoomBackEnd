import http from 'http';
import ioClient from 'socket.io-client';
import  SocketManager  from '../services/socketManager'; // Importamos la clase en lugar de la instancia

jest.mock('../services/socketManager'); // Creamos un mock para SocketManager

describe('SocketManager', () => {
  let server: http.Server;
  let serverPort: number;
  let serverUrl: string;
  let socketManager: SocketManager;

  beforeAll((done) => {
    // Inicializando el servidor HTTP
    server = http.createServer();
    socketManager = SocketManager.getInstance(); // Creamos una instancia de SocketManager

    // Mockeamos el método initSocketServer para evitar la conexión real
    (socketManager.initSocketServer as jest.Mock).mockImplementation((httpServer) => {
      // Implementación de initSocketServer mockeada
      console.log('Mocked initSocketServer called');
    });

    server.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address !== null) {
        serverPort = address.port;
        serverUrl = `http://localhost:${serverPort}`;
      }
      done();
    });
  });

  afterAll((done) => {
    // Cerrando el servidor
    server.close(() => {
      done();
    });
  });

  test('Conexión del cliente', (done) => {
    const clientSocket = ioClient(serverUrl);

    clientSocket.on('connect', () => {
      // Verificando que la conexión del cliente se haya establecido correctamente
      expect(clientSocket.connected).toBeTruthy();

      // Desconectando el cliente
      clientSocket.disconnect();

      // Indicando que la prueba ha finalizado
      done();
    });
  });

  test('Manejo de evento match', (done) => {
    // Creando un cliente socket.io
    const clientSocket = ioClient(serverUrl);

    clientSocket.on('connect', () => {
      const senderId = 'senderId';
      const receiverId = 'receiverId';

      // Escuchando el evento 'match' en el cliente
      clientSocket.on('match', (data) => {
        // Verificando que el evento 'match' se haya recibido correctamente
        expect(data.senderId).toBe(senderId);
        expect(data.receiverId).toBe(receiverId);

        // Desconectando el cliente
        clientSocket.disconnect();

        // Indicando que la prueba ha finalizado
        done();
      });

      // Emitiendo el evento 'match' desde el cliente
      clientSocket.emit('match', { senderId, receiverId });
    });
  });

});

