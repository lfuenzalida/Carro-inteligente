const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST - Confirmar compra (guardar en historial)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [cartItems] = await pool.query(`
      SELECT gc.product_id, gc.quantity, p.price
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'No hay productos en el carro' });
    }

    for (const item of cartItems) {
      await pool.query(`
        INSERT INTO purchase_history (user_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)`,
        [userId, item.product_id, item.quantity, item.price]
      );
    }

    await pool.query('DELETE FROM generated_cart WHERE user_id = ?', [userId]);

    res.json({ message: 'Compra registrada exitosamente' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Historial de compras por usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT ph.id, p.name, ph.quantity, ph.price,
             (ph.quantity * ph.price) AS total, ph.purchased_at
      FROM purchase_history ph
      JOIN products p ON ph.product_id = p.id
      WHERE ph.user_id = ?
      ORDER BY ph.purchased_at DESC
    `, [userId]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
