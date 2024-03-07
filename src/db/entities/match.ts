import pool from '../connection';
import { QueryResult } from 'pg';
import { Match } from '../../types/entities';

// Funciones CRUD para HacenMatch
export const createMatch = async (match: Match): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO HacenMatch (idUsuario, idUsuario2) VALUES ($1, $2)';
    const values = [match.idUsuario, match.idUsuario2];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al crear match: ${error.message}`);
    }
};

export const readAllMatches = async (idUsuario: number): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM HacenMatch WHERE idUsuario = $1';
    const values = [idUsuario];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch(error: any) {
        throw new Error(`Error al obtener matches: ${error.message}`);
    }
};

export const deleteMatch = async (idUsuario: number, idUsuario2: number): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM HacenMatch WHERE idUsuario = $1 AND idUsuario2 = $2';
    const values = [idUsuario, idUsuario2];

    try {
        const result = await pool.query(query, values);
        try {
            const query = 'DELETE FROM HacenMatch WHERE idUsuario = $2 AND idUsuario2 = $1';
            const values = [idUsuario, idUsuario2];
            const result = await pool.query(query, values);
            return result;
        }catch(error: any){
            throw new Error(`Error al eliminar match: ${error.message}`);
        }
    } catch(error: any) {
        throw new Error(`Error al eliminar match: ${error.message}`);
    }
};
