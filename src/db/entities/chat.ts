import pool from '../connection';
import { QueryResult } from 'pg';
import { Chat } from '../../types/entities';

// Funciones CRUD para Chat
export const createChat = async (Chatcion: Chat): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO Chat (Sala, Usuario, Estado) VALUES ($1, $2, $3) RETURNING *';
    const values = [Chatcion.Sala, Chatcion.Usuario, Chatcion.Estado];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al crear el chat: ${error.message}`);
    }
};

export const readChat = async (idSala: number, correoUsuario: string): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM Chat WHERE Sala = $1 AND Usuario = $2';
    const values = [idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al leer el chat: ${error.message}`);
    }
};

export const updateChatEstado = async (idSala: number, correoUsuario: string, nuevoEstado: 'Activo' | 'Inactivo'): Promise<QueryResult<any>> => {
    const query = 'UPDATE Chat SET Estado = $1 WHERE Sala = $2 AND Usuario = $3 RETURNING *';
    const values = [nuevoEstado, idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al actualizar estado del chat: ${error.message}`);
    }
};

export const deleteChat = async (idSala: number, correoUsuario: string): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Chat WHERE Sala = $1 AND Usuario = $2 RETURNING *';
    const values = [idSala, correoUsuario];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al eliminar chat: ${error.message}`);
    }
};