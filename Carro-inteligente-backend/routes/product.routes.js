// routes/product.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { name, price, category, is_offer, description, image_url, stock, brand, unit } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, category, is_offer, description, image_url, stock, brand, unit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, price, category, is_offer, description, image_url, stock, brand, unit]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar un producto existente
router.put('/:id', async (req, res) => {
  const { name, price, category, is_offer, description, image_url, stock, brand, unit } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ?, category = ?, is_offer = ?, description = ?, image_url = ?, stock = ?, brand = ?, unit = ?, updated_at = NOW() WHERE id = ?',
      [name, price, category, is_offer, description, image_url, stock, brand, unit, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
