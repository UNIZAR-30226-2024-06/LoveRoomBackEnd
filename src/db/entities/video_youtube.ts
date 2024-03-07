import pool from '../connection';
import { QueryResult } from 'pg';
import { VideoYoutube } from '../../types/entities';

// Funciones CRUD para VideoYoutube
export const createVideo = async (video: VideoYoutube): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO VideoYoutube (UrlVideo, idUsuario) VALUES ($1, $2)';
    const values = [video.UrlVideo, video.idUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al crear video: ${error.message}`);
    }
};

export const readVideo = async (urlVideo: string, idUsuario: number): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM VideoYoutube WHERE UrlVideo = $1 AND idUsuario = $2';
    const values = [urlVideo, idUsuario];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch(error: any) {
        throw new Error(`Error al leer video: ${error.message}`);
    }
};

export const deleteVideo = async (urlVideo: string, idUsuario: number): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM VideoYoutube WHERE UrlVideo = $1 AND idUsuario = $2';
    const values = [urlVideo, idUsuario];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch(error: any) {
        throw new Error(`Error al eliminar video: ${error.message}`);
    }
};

export const usersWatchingVideo = async (urlVideo: string): Promise<QueryResult<any>> => {
    const query = 'SELECT V.idUsuario FROM VideoYoutube V WHERE V.UrlVideo = $1';
    const values = [urlVideo];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al obtener usuarios que ven el video: ${error.message}`);
    }
};
