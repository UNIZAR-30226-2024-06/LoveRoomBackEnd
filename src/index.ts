import express, { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import routes from "./routes";
import SocketManager from "./services/socketManager";
import { createServer } from "http";

const jwt = require("jsonwebtoken");
const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Para parsear el body de las peticiones a JSON
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Middleware para los headers
app.use((req: Request, res: Response, next) => {
  // Headers de seguridad
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Headers CORS
  // Cambiar el * por el dominio del cliente para restringir el acceso a solo ese dominio
  // Cuidado, pueden seguir accediendo desde herramientas como Postman
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Content-Length, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH"
    );
    return res.status(200).json({});
  }
  // Pasamos al siguiente middleware
  next();
});

app.use("/", routes);

app.use((req, res) => {
  // Not found error
  res.status(404).json({ message: "404 Not Found" });
});

const httpServer = createServer(app);
SocketManager.getInstance().initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

export { app, prisma, jwt };
