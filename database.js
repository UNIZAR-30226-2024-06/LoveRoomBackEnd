const { Pool } = require('pg');

const pool = new Pool({
  user: 'tu-usuario',
  host: 'tu-host',
  database: 'tu-nombre-de-base-de-datos',
  password: 'tu-contraseña',
  port: 5432, 
});

// Funciones CRUD para Usuario
const createUser = (usuario, callback) => {
    const query = 'INSERT INTO Usuario (Correo, Nombre, Descripcion, Contrasena, Edad, Sexo, Preferencias, TipoUsuario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
    const values = [usuario.Correo, usuario.Nombre, usuario.Descripcion, usuario.Contrasena, usuario.Edad, usuario.Sexo, usuario.Preferencias, usuario.TipoUsuario];

    pool.query(query, values, callback);
};

const readUser = (correo, callback) => {
    const query = 'SELECT * FROM Usuario WHERE Correo = $1';
    const values = [correo];

    pool.query(query, values, callback);
};

const updateUser = (correo, datosActualizados, callback) => {
    const query = 'UPDATE Usuario SET Nombre = $1, Descripcion = $2, Contrasena = $3, Edad = $4, Sexo = $5, Preferencias = $6, TipoUsuario = $7 WHERE Correo = $8';
    const values = [datosActualizados.Nombre, datosActualizados.Descripcion, datosActualizados.Contrasena, datosActualizados.Edad, datosActualizados.Sexo, datosActualizados.Preferencias, datosActualizados.TipoUsuario, correo];

    pool.query(query, values, callback);
};

const deleteUser = (correo, callback) => {
    const query = 'DELETE FROM Usuario WHERE Correo = $1';
    const values = [correo];

    pool.query(query, values, callback);
};

// Funciones CRUD para VideoYoutube

const createVideo = (UrlVideo,idUsuario, callback) => {
    const query = 'INSERT INTO VideoYoutube (UrlVideo, idUsuario) VALUES ($1, $2)';
    const values = [UrlVideo, idUsuario];
  
    pool.query(query, values, callback);
  };
  
const readVideo = (urlVideo, idUsuario, callback) => {
    const query = 'SELECT * FROM VideoYoutube WHERE UrlVideo = $1 AND idUsuario = $2';
    const values = [urlVideo, idUsuario];

    pool.query(query, values, callback);
};

const deleteVideo = (urlVideo, idUsuario, callback) => {
    const query = 'DELETE FROM VideoYoutube WHERE UrlVideo = $1 AND idUsuario = $2';
    const values = [urlVideo, idUsuario];

    pool.query(query, values, callback);
};

const usersWatchingVideo = (urlVideo, callback) => {
    const query = 'SELECT V.idUsuario FROM VideoYoutube V WHERE V.UrlVideo = $1';
    const values = [urlVideo];

    pool.query(query,values,callback);
};

// Funciones CRUD para HacenMatch
const createMatch = (idUsuario, idUsuario2, callback) => {
    const query = 'INSERT INTO HacenMatch (idUsuario, idUsuario2) VALUES ($1, $2)';
    const values = [idUsuario, idUsuario2];

    pool.query(query, values, callback);
};


const readAllMatches = (idUsuario, callback) => {
    const query = 'SELECT * FROM HacenMatch WHERE idUsuario = $1';
    const values = [idUsuario];

    pool.query(query, values, callback);
};

const deleteMatch = (idUsuario, idUsuario2, callback) => {
    const query = 'DELETE FROM HacenMatch WHERE idUsuario = $1 AND idUsuario2 = $2';
    const values = [idUsuario, idUsuario2];

    pool.query(query, values, callback);
};


module.exports = {
    createUser,
    readUser,
    updateUser,
    deleteUser,
    createVideo,
    readVideo,
    deleteVideo,
    usersWatchingVideo,
    createMatch,
    readAllMatches,
    deleteMatch
};
