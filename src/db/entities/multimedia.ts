import pool from '../connection';
import { QueryResult } from 'pg';
import { Multimedia } from '../../types/entities';

// Funciones CRUD para Multimedia
export const createMultimedia = async (multimedia: Multimedia): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO Multimedia (Fecha, Nombre, Ruta, TipoMultimedia) VALUES ($1, $2, $3, $4) RETURNING ID';
    const values = [multimedia.Fecha, multimedia.Nombre, multimedia.Ruta, multimedia.TipoMultimedia];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al crear multimedia: ${error.message}`);
    }
};

export const readMultimedia = async (id: number): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM Multimedia WHERE ID = $1';
    const values = [id];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al leer multimedia: ${error.message}`);
    }
};

export const updateMultimedia = async (id: number, nuevosDatos: Multimedia): Promise<QueryResult<any>> => {
    const query = 'UPDATE Multimedia SET Fecha = $1, Nombre = $2, Ruta = $3, TipoMultimedia = $4 WHERE ID = $5 RETURNING *';
    const values = [nuevosDatos.Fecha, nuevosDatos.Nombre, nuevosDatos.Ruta, nuevosDatos.TipoMultimedia, id];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al actualizar multimedia: ${error.message}`);
    }
};

export const deleteMultimedia = async (id: number): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Multimedia WHERE ID = $1 RETURNING *';
    const values = [id];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al eliminar multimedia: ${error.message}`);
    }
};