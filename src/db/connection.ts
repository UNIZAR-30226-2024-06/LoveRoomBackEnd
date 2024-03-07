import { Pool } from 'pg';

const pool = new Pool({
  user: 'benedi',
  host: '127.0.0.1',
  database: 'benedi',
  password: '1111',
  port: 5432,
});

export default pool;