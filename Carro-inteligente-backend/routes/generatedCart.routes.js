const express = require('express');
const router = express.Router();
const pool = require('../db');



// POST manual para insertar productos al carro generado
router.post('/manual/:userId', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    await pool.query(
      `INSERT INTO generated_cart (user_id, product_id, quantity, source)
       VALUES (?, ?, ?, 'history')`,
      [userId, productId, quantity]
    );

    res.status(201).json({ message: 'Producto insertado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST - Agregar producto manualmente al carro generado
router.post('/add/:userId', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      VALUES (?, ?, ?, 'history')
    `, [userId, productId, quantity]);


    res.status(201).json({ message: 'Producto agregado al carro generado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Generar carro inteligente (POST /api/smart-cart/:userId)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(`DELETE FROM generated_cart WHERE user_id = ?`, [userId]);

    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      SELECT user_id, product_id, quantity, 'favorite'
      FROM favorite_cart
      WHERE user_id = ?
    `, [userId]);

    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      SELECT ?, product_id, 1, 'history'
      FROM (
        SELECT product_id, COUNT(*) AS veces
        FROM purchase_history
        WHERE user_id = ?
        GROUP BY product_id
        HAVING veces >= 3
      ) AS frecuentes
    `, [userId, userId]);

    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      SELECT ?, ph.product_id, 1, 'offer'
      FROM purchase_history ph
      JOIN products p ON ph.product_id = p.id
      WHERE ph.user_id = ? AND p.is_offer = TRUE
      GROUP BY ph.product_id
      HAVING COUNT(*) BETWEEN 1 AND 2
    `, [userId, userId]);

    // --- Validación del presupuesto ---
    const [[user]] = await pool.query(
      'SELECT budget_limit FROM users WHERE id = ?',
      [userId]
    );

    const [[totalRow]] = await pool.query(
      `SELECT SUM(gc.quantity * p.price) AS total
       FROM generated_cart gc
       JOIN products p ON gc.product_id = p.id
       WHERE gc.user_id = ?`,
      [userId]
    );

    let total = totalRow.total || 0;
    const prioridad = ['offer', 'history', 'favorite'];

    for (const fuente of prioridad) {
      if (total <= user.budget_limit) break;

      const [items] = await pool.query(
        `SELECT gc.id, p.price, gc.quantity
         FROM generated_cart gc
         JOIN products p ON gc.product_id = p.id
         WHERE gc.user_id = ? AND gc.source = ?
         ORDER BY gc.id ASC`,
        [userId, fuente]
      );

      for (const item of items) {
        if (total <= user.budget_limit) break;

        await pool.query('DELETE FROM generated_cart WHERE id = ?', [item.id]);
        total -= item.price * item.quantity;
      }
    }

    const [finalCart] = await pool.query(`
      SELECT gc.id, p.name, gc.quantity, p.price, gc.source,
            (p.price * gc.quantity) AS subtotal
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?
    `, [userId]);

    res.json({
      message: 'Carro inteligente generado con éxito',
      budget_limit: user.budget_limit,
      total_used: total,
      budget_remaining: user.budget_limit - total,
      cart: finalCart
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET - Mostrar carro generado
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT gc.id, p.name, gc.quantity, p.price, gc.source,
             (p.price * gc.quantity) AS subtotal
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?
    `, [userId]);
    

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
