const express = require('express');
const router = express.Router();
const pool = require('../db');


// 1. GET - Obtener el carro favorito de un usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT fc.id, p.name, fc.quantity, p.price, (fc.quantity * p.price) AS total
      FROM favorite_cart fc
      JOIN products p ON fc.product_id = p.id
      WHERE fc.user_id = ?
    `, [userId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2. POST - Agregar producto al carro favorito
router.post('/', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    await pool.query(`
      INSERT INTO favorite_cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
    `, [user_id, product_id, quantity]);

    res.status(201).json({ message: 'Producto agregado al carro favorito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar cantidad de un producto en el carro favorito
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await pool.query(`
      UPDATE favorite_cart
      SET quantity = ?
      WHERE id = ?
    `, [quantity, id]);

    res.json({ message: 'Cantidad del producto actualizada en el carro favorito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }     
})


// DELETE - Eliminar un producto del carro favorito
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`
      DELETE FROM favorite_cart
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Producto eliminado del carro favorito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
