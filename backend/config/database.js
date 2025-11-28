import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asistencia_qr',
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
pool.connect()
  .then(client => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  });

// Wrapper para mantener compatibilidad con el código existente
const query = async (text, params) => {
  const result = await pool.query(text, params);
  return [result.rows, result.rowCount];
};

export default { query, pool };
