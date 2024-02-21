CREATE TABLE IF NOT EXISTS Usuario (
    Correo VARCHAR(30) NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(500) NOT NULL,
    Contrasena VARCHAR(100) NOT NULL,
    Edad INT NOT NULL,
    Sexo VARCHAR(6) NOT NULL CHECK (Sexo IN ('Hombre', 'Mujer', 'Otro')),
    Preferencias VARCHAR(100) NOT NULL CHECK (Preferencias IN ('Hombre', 'Mujer', 'Ambos')),
    TipoUsuario VARCHAR(100) NOT NULL CHECK (TipoUsuario IN ('Normal', 'Premium')),
    PRIMARY KEY (Correo)
);

CREATE TABLE IF NOT EXISTS VideoYoutube (
    UrlVideo VARCHAR(100) NOT NULL, 
    idUsuario VARCHAR(100) NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(Correo),
    PRIMARY KEY (UrlVideo, idUsuario)
);

CREATE TABLE IF NOT EXISTS HacenMatch(
    idUsuario VARCHAR(100) NOT NULL,
    idUsuario2 VARCHAR(100) NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(Correo),
    FOREIGN KEY (idUsuario2) REFERENCES Usuario(Correo)
    PRIMARY KEY (idUsuario, idUsuario2)
);

CREATE TABLE IF NOT EXISTS Multimedia (
    ID INT AUTO_INCREMENT,
    Fecha DATE NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Ruta VARCHAR(100) NOT NULL,
    TipoMultimedia VARCHAR(100) NOT NULL CHECK (TipoMultimedia IN ('VideoLocal', 'Mensaje')),
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Sala (
    IdSala INT AUTO_INCREMENT,
    UrlVideo VARCHAR(100) NOT NULL,
    PRIMARY KEY (IdSala)
);

CREATE TABLE IF NOT EXISTS Participa (
    Sala INT NOT NULL,
    Usuario VARCHAR(100) NOT NULL,
    Estado VARCHAR(100) NOT NULL CHECK (Estado IN ('Activo', 'Inactivo')), -- AÑADIR LOS NECESARIOS
    FOREIGN KEY (IdSala) REFERENCES Sala(IdSala),
    FOREIGN KEY (Usuario) REFERENCES Usuario(Correo),
    PRIMARY KEY (IdSala, idUsuario)
);