import pool from '../connection';
import { QueryResult } from 'pg';
import { Sala } from '../../types/entities';

// Funciones CRUD para Sala
export const createSala = async (sala: Sala): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO Sala (UrlVideo) VALUES ($1) RETURNING *';
    const values = [sala.UrlVideo];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al crear sala: ${error.message}`);
    }
};

export const readSala = async (idSala: number): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM Sala WHERE IdSala = $1';
    const values = [idSala];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al leer sala: ${error.message}`);
    }
};

export const updateSala = async (idSala: number, nuevaUrlVideo: string): Promise<QueryResult<any>> => {
    const query = 'UPDATE Sala SET UrlVideo = $1 WHERE IdSala = $2 RETURNING *';
    const values = [nuevaUrlVideo, idSala];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al actualizar sala: ${error.message}`);
    }
};

export const deleteSala = async (idSala: number): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Sala WHERE IdSala = $1 RETURNING *';
    const values = [idSala];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al eliminar sala: ${error.message}`);
    }
};