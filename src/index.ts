import express, { Express, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import routes from './routes';

const jwt = require('jsonwebtoken');
const app: Express = express();
let prisma = new PrismaClient();
const port =  3000;

app.use('/', routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});


export { app, prisma, jwt };