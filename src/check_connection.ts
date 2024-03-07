import express, { Router, Express, Request, Response } from "express";
import pool from './db/connection';

const usuario = require('./db/entities/usuario');
const sala = require('./db/entities/sala');
const match = require('./db/entities/match');
const multimedia = require('./db/entities/multimedia');
const participa = require('./db/entities/participa');
const mensaje = require('./db/entities/mensaje');
const video_youtube = require('./db/entities/video_youtube');

import * as entities from './types/entities';

export const routerConnectionCheck = express.Router();

routerConnectionCheck.get("/", (req: Request, res: Response) => {
    res.send(" Saludos desde el modulo connect");
  });

routerConnectionCheck.get("/user", async (req: Request, res: Response) => {
  try {
const usuario = require('./db/entities/usuario');
    const result = await usuario.readUser("1");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el usuario");
  }
})

routerConnectionCheck.get("/insertar", async (req: Request, res: Response) => {
  const miVideo: entities.VideoYoutube = {
    UrlVideo: "https://www.youtube.com/watch?v=abcdefghijk",
    idUsuario: 2
  };

  const miSala: entities.Sala = {
    UrlVideo: "https://www.youtube.com/watch?v=abcdefghijk"
  };

  const miMultimedia: entities.Multimedia = {
    Fecha: "2021-10-10",
    Nombre: "video1",
    Ruta: "https://www.youtube.com/watch?v=abcdefghijk",
    TipoMultimedia: "VideoLocal"
  };

  const miParticipa: entities.Participa = {
    Usuario: 1,
    Sala: 1,
    Estado: "Activo"
  };

  const miUsuario: entities.Usuario = {
    Correo: "12@gmail.com",
    Nombre: "Juan",
    Descripcion: "Hola",
    Contrasena: "123",
    Edad: 20,
    Sexo: "Hombre",
    Preferencias: "Mujer",
    TipoUsuario: "Premium"
  };

  const miMensaje: entities.Mensaje = {
    Sala: 2,
    Usuario: 1,
    Mensaje: "Hola",
    FechaHora: "2021-10-10",
    idMultimedia: "1"
  };
  
  try {
    let result;
    /*
    result = await video_youtube.createVideo(miVideo);
    result = await video_youtube.readVideo(miVideo.UrlVideo, miVideo.idUsuario);
    result = await sala.createSala(miSala);
    result = await multimedia.createMultimedia(miMultimedia);
    result = await participa.createParticipa(miParticipa);
    result = await mensaje.createMensaje(miMensaje);
    */
    res.send("Se ha insertado todo correctamente");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el usuario");
  }
});

routerConnectionCheck.get("/consultar", async (req: Request, res: Response) => {
  try {
    let result;
    result = await usuario.readUser("1");
    console.log("User" , result);
    result = await sala.readSala(1);
    console.log("Sala", result);
    result = await multimedia.readMultimedia(2);
    console.log("Multi", result);
    result = await participa.readParticipa(1, 1);
    console.log("Participa", result);
    res.send("Se ha mostrado todos");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el usuario");
  }
});
