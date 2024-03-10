import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';
import  { SalaController } from './controllers/salaController';
import routes from './routes';
import { createServer } from "http";  


const app: Express = express();
const httpServer = createServer(app);  
const prisma = new PrismaClient();
const port =  3000;
const io = new Server(httpServer);  // Pasa el servidor HTTP a la instancia de Server de Socket.IO
 

SalaController.initializeSocketManager(io);

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});


export { app, prisma};