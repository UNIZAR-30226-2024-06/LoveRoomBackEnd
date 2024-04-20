
import ioClient from 'socket.io-client';



test('one connection from a client',async () => {
  const client = ioClient('http://localhost:5000');
  client.on('connect', async() => {
    expect(client.connected).toBeTruthy();
    client.disconnect();
  });
});