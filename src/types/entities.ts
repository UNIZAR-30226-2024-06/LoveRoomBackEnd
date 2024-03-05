export interface Usuario {
    Correo: string;
    Nombre: string;
    Descripcion: string;
    Contrasena: string;
    Edad: number;
    Sexo: string;
    Preferencias: string;
    TipoUsuario: string;
}

export interface VideoYoutube {
    UrlVideo: string;
    idUsuario: number;
}

export interface Match {
    idUsuario: number;
    idUsuario2: number;
}

export interface Multimedia {
    ID?: number;
    Fecha: string;
    Nombre: string;
    Ruta: string;
    TipoMultimedia: string;
}

export interface Sala {
    idSala?: number;
    UrlVideo: string;
}

export interface Chat {
    Sala : number;
    Usuario : number;
    Estado : string;
}

export interface Mensaje {
    idMensaje?: number;
    Sala: number;
    Usuario: number;
    Mensaje: string;
    FechaHora: string;
    idMultimedia: string;
}

