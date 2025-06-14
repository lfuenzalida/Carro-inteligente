const express = require('express');
const router = express.Router();
const pool = require('../db');


// 1. GET - Obtener el carro favorito de un usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT fc.id, p.name, p.brand, fc.quantity, p.price, (fc.quantity * p.price) AS total
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

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // Verifica si ya existe
    const [[existing]] = await pool.query(
      `SELECT id, quantity FROM favorite_cart WHERE user_id = ? AND product_id = ?`,
      [user_id, product_id]
    );

    if (existing) {
      // Si existe, actualiza la cantidad
      await pool.query(
        `UPDATE favorite_cart SET quantity = quantity + ? WHERE id = ?`,
        [quantity, existing.id]
      );
    } else {
      // Si no existe, lo inserta
      await pool.query(
        `INSERT INTO favorite_cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [user_id, product_id, quantity]
      );
    }

    res.status(200).json({ message: 'Producto agregado/actualizado al favorito' });
  } catch (err) {
    console.error('❌ Error al agregar favorito:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar cantidad de un producto en el carro favorito
router.put('/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE favorite_cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
      [quantity, userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carro favorito' });
    }

    res.status(200).json({ message: 'Cantidad actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar cantidad:', err);
    res.status(500).json({ error: err.message });
  }
});

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
