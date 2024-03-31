import Client, { Socket as SocketIOClient } from 'socket.io-client';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Socket } from 'socket.io';

describe('NetworkController', () => {
    let ioServer: Server;
    let httpServer: ReturnType<typeof createServer>;
    let clientSocket1: SocketIOClient;
    let clientSocket2: SocketIOClient;
    // Initialize your NetworkController here
    const networkController = new socketManager();

    ioServer.on('connection', (socket: Socket) => {
        networkController.initialize(socket);
    });
    beforeAll((done) => {
        httpServer = createServer();
        ioServer = new Server(httpServer);

        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket1 = Client(`http://localhost:${port}`);
            clientSocket2 = Client(`http://localhost:${port}`);

            ioServer.on('connection', (socket) => {
                // Initialize your NetworkController here with the socket
            });

            clientSocket1.on('connect', done);
            clientSocket2.on('connect', done);
        });
    });

    afterAll(() => {
        ioServer.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    test('two users should match and join a sala', (done) => {
        clientSocket1.emit('match', { /* your match data here */ });
        clientSocket2.emit('match', { /* your match data here */ });

        clientSocket1.on('joinSala', (data) => {
            // Add your assertions here for user 1
        });

        clientSocket2.on('joinSala', (data) => {
            // Add your assertions here for user 2
            done();
        });
    });
});