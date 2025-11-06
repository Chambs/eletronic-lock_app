const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DATABASE_HOST || 'postgres-service.electronic-lock-app.svc.cluster.local',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'electronic_lock_app',
    user: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'admin',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

process.on('SIGINT', () => {
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

module.exports = pool;