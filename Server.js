
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('API de Inventario Electrónico funcionando correctamente');
});

// Consultar todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const [productos] = await pool.query(
            'SELECT * FROM productos ORDER BY id DESC'
        );
        res.json(productos);
    } catch (error) {
        console.error('Error al consultar productos:', error.message);
        res.status(500).json({ error: 'Error al consultar productos' });
    }
});

/* Buscar productos por nombre */
app.get('/api/productos/buscar/:nombre', async (req, res) => {
    try {
        const nombre = req.params.nombre;

        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE nombre LIKE ? ORDER BY id DESC',
            [`%${nombre}%`]
        );

        res.json(productos);
    } catch (error) {
        console.error('Error al buscar productos:', error.message);
        res.status(500).json({
            error: 'Error al buscar productos'
        });
    }
});


/* Consultar productos con stock bajo */
app.get('/api/productos/stock-bajo', async (req, res) => {
    try {
        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE stock <= ? ORDER BY stock ASC',
            [5]
        );

        res.json(productos);
    } catch (error) {
        console.error('Error al consultar stock bajo:', error.message);
        res.status(500).json({
            error: 'Error al consultar productos con stock bajo'
        });
    }
});


// Consultar un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE id = ?',
            [req.params.id]
        );

        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(productos[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el producto' });
    }
});

// Registrar un producto
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Nombre, precio y stock son obligatorios'
            });
        }

        if (
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0 ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: 'Precio y stock deben ser valores válidos y no negativos'
            });
        }

        const [resultado] = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
            [nombre, descripcion || null, Number(precio), Number(stock)]
        );

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar:', error.message);
        res.status(500).json({ error: 'Error al registrar producto' });
    }
});

// Actualizar un producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Nombre, precio y stock son obligatorios'
            });
        }

        if (
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0 ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: 'Precio y stock deben ser valores válidos y no negativos'
            });
        }

        const [resultado] = await pool.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?',
            [nombre, descripcion || null, Number(precio), Number(stock), req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar:', error.message);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const [resultado] = await pool.query(
            'DELETE FROM productos WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar:', error.message);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Iniciar servidor después de comprobar la conexión
async function iniciarServidor() {
    try {
        const conexion = await pool.getConnection();
        await conexion.ping();
        conexion.release();

        console.log('Conexión con MySQL exitosa');

        app.listen(PORT, () => {
            console.log(`Servidor activo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error de conexión con MySQL:', error.message);
        process.exitCode = 1;
    }
}

iniciarServidor();
