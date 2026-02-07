
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// Strip query params to ensure we control SSL via config object or just minimal params
const originalUrl = process.env.DATABASE_URL;
const urlObj = new URL(originalUrl);
urlObj.search = ''; // Remove all params like sslmode, channel_binding
const cleanUrl = urlObj.toString();

console.log('Testing connection to:', urlObj.host);

const pool = new Pool({
    connectionString: cleanUrl,
    ssl: {
        rejectUnauthorized: false // Relax SSL for testing
    },
    connectionTimeoutMillis: 5000 // Fail existing faster
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    }
}

testConnection();
