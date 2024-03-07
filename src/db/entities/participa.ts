import pool from '../connection';
import { QueryResult } from 'pg';
import { Participa } from '../../types/entities';

// Funciones CRUD para Chat
export const createParticipa = async (Chatcion: Participa): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO Participa (Sala, Usuario, Estado) VALUES ($1, $2, $3) RETURNING *';
    const values = [Chatcion.Sala, Chatcion.Usuario, Chatcion.Estado];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al crear participacion: ${error.message}`);
    }
};

export const readParticipa = async (idSala: number, correoUsuario: string): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM Participa WHERE Sala = $1 AND Usuario = $2';
    const values = [idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error: any) {
        throw new Error(`Error al leer participacion: ${error.message}`);
    }
};

export const updateParticipaEstado = async (idSala: number, correoUsuario: string, nuevoEstado: 'Activo' | 'Inactivo'): Promise<QueryResult<any>> => {
    const query = 'UPDATE Participa SET Estado = $1 WHERE Sala = $2 AND Usuario = $3 RETURNING *';
    const values = [nuevoEstado, idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al actualizar estado participacion: ${error.message}`);
    }
};

export const deleteParticipa = async (idSala: number, correoUsuario: string): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Participa WHERE Sala = $1 AND Usuario = $2 RETURNING *';
    const values = [idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al eliminar participacion: ${error.message}`);
    }
};