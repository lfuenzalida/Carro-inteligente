// 1. Importamos express y creamos un router
const express = require('express');
const router = express.Router();

// 2. Importamos la conexión a la base de datos
const pool = require('../db');

// 3. Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    // Ejecutamos la consulta SQL para obtener todos los productos
    const [rows] = await pool.query('SELECT * FROM products');
    
    // Enviamos los productos como JSON
    res.json(rows);
  } catch (err) {
    // En caso de error, devolvemos código 500 y el mensaje de error
    res.status(500).json({ error: err.message });
  }
});

// 4. Exportamos el router para usarlo en index.js
module.exports = router;
