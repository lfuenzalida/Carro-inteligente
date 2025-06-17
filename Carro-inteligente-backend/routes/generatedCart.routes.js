const express = require('express');
const router = express.Router();
const pool = require('../db');

// Agrega un producto manual al carro generado
router.post('/add/:userId', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity, source = 'history' } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'productId y quantity son requeridos' });
  }

  
  console.log('🛠 Datos recibidos:', { userId, productId, quantity, source });

  try {

            const [[user]] = await pool.query(`SELECT id, name FROM users WHERE id = ?`, [userId]);
            console.log('Usuario encontrado:', user?.name || 'NO ENCONTRADO');

            const [[product]] = await pool.query(`SELECT id, name FROM products WHERE id = ?`, [productId]);
            console.log('Producto encontrado:', product?.name || 'NO ENCONTRADO');

    if (!user || !product) {
      return res.status(400).json({ error: 'userId o productId no válido' });
    }


    const uid = Number(userId);
    const pid = Number(productId);
    const qty = Number(quantity);

    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      VALUES (?, ?, ?, ?)`,
      [uid, pid, qty, source]
    );

    res.status(201).json({ message: 'Producto agregado al carro generado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Genera el carro inteligente completo respetando el presupuesto
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(`DELETE FROM generated_cart WHERE user_id = ?`, [userId]);

    const inserts = [
      {
        query: `
          INSERT INTO generated_cart (user_id, product_id, quantity, source)
          SELECT user_id, product_id, quantity, 'favorite'
          FROM favorite_cart WHERE user_id = ?`,
        params: [userId],
      },
      {
        query: `
          INSERT INTO generated_cart (user_id, product_id, quantity, source)
          SELECT ?, product_id, 1, 'history'
          FROM (
            SELECT product_id FROM purchase_history
            WHERE user_id = ?
            GROUP BY product_id
            HAVING COUNT(*) >= 3
          ) AS frecuentes`,
        params: [userId, userId],
      },
      {
        query: `
          INSERT INTO generated_cart (user_id, product_id, quantity, source)
          SELECT ?, ph.product_id, 1, 'offer'
          FROM purchase_history ph
          JOIN products p ON ph.product_id = p.id
          WHERE ph.user_id = ? AND p.is_offer = TRUE
          GROUP BY ph.product_id
          HAVING COUNT(*) BETWEEN 1 AND 2`,
        params: [userId, userId],
      }
    ];

    for (const { query, params } of inserts) {
      await pool.query(query, params);
    }

    const [[user]] = await pool.query(`SELECT budget_limit FROM users WHERE id = ?`, [userId]);

    let [[{ total = 0 }]] = await pool.query(`
      SELECT SUM(gc.quantity * p.price) AS total
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?`, [userId]);

    const prioridad = ['offer', 'history', 'favorite'];

    for (const fuente of prioridad) {
      if (total <= user.budget_limit) break;

      const [items] = await pool.query(`
        SELECT gc.id, p.price, gc.quantity
        FROM generated_cart gc
        JOIN products p ON gc.product_id = p.id
        WHERE gc.user_id = ? AND gc.source = ?
        ORDER BY gc.id ASC`, [userId, fuente]);

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
      WHERE gc.user_id = ?`, [userId]);

    res.json({
      message: 'Carro inteligente generado con éxito',
      budget_limit: user.budget_limit,
      total_used: total,
      budget_remaining: user.budget_limit - total,
      cart: finalCart,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener el carro generado
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        gc.product_id,
        p.name,
        p.price,
        gc.quantity,
        gc.source
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener el carro generado:', err);
    res.status(500).json({ error: 'Error al obtener el carro generado' });
  }
});

router.post('/from-favorites/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query('DELETE FROM generated_cart WHERE user_id = ?', [userId]);

    await pool.query(`
      INSERT INTO generated_cart (user_id, product_id, quantity, source)
      SELECT user_id, product_id, quantity, 'favorite'
      FROM favorite_cart
      WHERE user_id = ?`, [userId]);

    const [cart] = await pool.query(`
      SELECT gc.id, p.name, gc.quantity, p.price, gc.source,
             (p.price * gc.quantity) AS subtotal
      FROM generated_cart gc
      JOIN products p ON gc.product_id = p.id
      WHERE gc.user_id = ?`, [userId]);

    res.json({ message: 'Favoritos cargados al carro generado', cart });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

