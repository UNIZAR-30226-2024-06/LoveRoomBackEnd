import { Pool } from 'pg';

const pool = new Pool({
  user: 'tu-usuario',
  host: 'tu-host',
  database: 'tu-nombre-de-base-de-datos',
  password: 'tu-contraseña',
  port: 5432,
});

export default pool;