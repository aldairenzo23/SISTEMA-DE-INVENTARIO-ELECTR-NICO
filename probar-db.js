
require('dotenv').config();

const pool = require('./db');

async function probarConexion() {
    try {
        const [filas] = await pool.query(
            'SELECT VERSION() AS version, DATABASE() AS base_datos'
        );

        console.log('¡Conexión con MySQL exitosa!');
        console.log('Versión:', filas[0].version);
        console.log('Base de datos:', filas[0].base_datos);
    } catch (error) {
        console.error('Error de conexión:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();
