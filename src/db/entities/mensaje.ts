import pool from '../connection';
import { QueryResult } from 'pg';
import { Chat,Multimedia,Mensaje } from '../../types/entities';

// Función de mapeo para Mensaje
function mapRowToMensaje(row: any): Mensaje {
    return {
      idMensaje: row.ID,
      Sala: row.Sala,
      Usuario: row.Usuario,
      Mensaje: row.Texto,
      FechaHora: row.FechaHora,
      idMultimedia: row.idMultimedia,
    };
}

// Funciones CRUD para Mensaje
export const createMensaje = async (mensaje: Mensaje): Promise<QueryResult<any>> => {
    const query = 'INSERT INTO Mensaje (Sala, Usuario, Texto, FechaHora, idMultimedia) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [mensaje.Sala, mensaje.Usuario, mensaje.Mensaje, mensaje.FechaHora, mensaje.idMultimedia];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al crear mensaje: ${error.message}`);
    }
};

export const readMensajeAllMessagesInChat = async ( idChat: number): Promise<Mensaje[] | null> => {
    const query = 'SELECT * FROM Mensaje WHERE Sala = $1 ORDER BY FechaHora';
    const values = [idChat];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {  
            const mensajes: Mensaje[] = result.rows.map((row: any) => mapRowToMensaje(row));

            return mensajes;
        }

        return null;
    } catch (error: any) {
        throw new Error(`Error al leer mensaje: ${error.message}`);
    }
};

export const updateMensaje = async (mensajeID: number, nuevosDatos: Mensaje): Promise<QueryResult<any>> => {
    const query = 'UPDATE Mensaje SET Sala = $1, Usuario = $2, Texto = $3, FechaHora = $4, idMultimedia = $5 WHERE ID = $6 RETURNING *';
    const values = [nuevosDatos.Sala, nuevosDatos.Usuario, nuevosDatos.Mensaje, nuevosDatos.FechaHora, nuevosDatos.idMultimedia, mensajeID];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al actualizar mensaje: ${error.message}`);
    }
};

export const deleteMensaje = async (mensajeID: number): Promise<QueryResult<any>> => {
    const query = 'DELETE FROM Mensaje WHERE ID = $1 RETURNING *';
    const values = [mensajeID];

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error: any) {
        throw new Error(`Error al eliminar mensaje: ${error.message}`);
    }
};
