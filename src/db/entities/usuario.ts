import pool from '../connection';
import { QueryResult } from 'pg';
import { Usuario } from '../../types/entities';


// Funciones CRUD para Usuario
export const readUser = async (correo: string): Promise<QueryResult<any>> => {
    const query = 'SELECT * FROM Usuario WHERE Correo = $1';
    const values = [correo];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al leer usuario: ${error.message}`);
    }
};

export const updateUser = async (correo: string, datosActualizados: Usuario): Promise<QueryResult<any>> => {
    const query = 'UPDATE Usuario SET Nombre = $1, Descripcion = $2, Contrasena = $3, Edad = $4, Sexo = $5, Preferencias = $6, TipoUsuario = $7 WHERE Correo = $8';
    const values = [datosActualizados.Nombre, datosActualizados.Descripcion, datosActualizados.Contrasena, datosActualizados.Edad, datosActualizados.Sexo, datosActualizados.Preferencias, datosActualizados.TipoUsuario, correo];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
};

export const deleteUser = async (correo: string): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Usuario WHERE Correo = $1';
    const values = [correo];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch(error: any) {
        throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
};