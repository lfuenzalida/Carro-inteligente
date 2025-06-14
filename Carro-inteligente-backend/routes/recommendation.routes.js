const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Paso 1: obtener las 10 fechas de compra más recientes
    const [dateRows] = await pool.query(`
      SELECT DISTINCT DATE(purchased_at) as date
      FROM purchase_history
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 10
    `, [userId]);

    const dates = dateRows.map(row => row.date);
    if (dates.length === 0) {
      return res.json({ most: [], regular: [], occasional: [] });
    }

    // Paso 2: construir mapa producto → fechas únicas en las que aparece
    const productDateMap = new Map(); // product_id => Set de fechas

    for (const date of dates) {
      const [products] = await pool.query(`
        SELECT DISTINCT product_id
        FROM purchase_history
        WHERE user_id = ? AND DATE(purchased_at) = ?
      `, [userId, date]);

      for (const row of products) {
        if (!productDateMap.has(row.product_id)) {
          productDateMap.set(row.product_id, new Set());
        }
        productDateMap.get(row.product_id).add(date);
      }
    }

    // Paso 3: clasificar según frecuencia de aparición en fechas distintas
    const most = [], regular = [], occasional = [];

    const totalOcasiones = dates.length;

    for (const [productId, dateSet] of productDateMap.entries()) {
      const percent = (dateSet.size / totalOcasiones) * 100;

      if (percent >= 70) {
        most.push(productId);
      } else if (percent >= 50) {
        regular.push(productId);
      } else if (percent < 30) {
        occasional.push(productId);
      }
    }

    // Paso 4: traer detalles
    const getProducts = async (ids) => {
      if (ids.length === 0) return [];
      const [rows] = await pool.query(`
        SELECT id, name, price, image_url, description
        FROM products
        WHERE id IN (${ids.map(() => '?').join(',')})
      `, ids);
      return rows;
    };

    const [mostGroup, regularGroup, occasionalGroup] = await Promise.all([
      getProducts(most),
      getProducts(regular),
      getProducts(occasional)
    ]);

    console.log('🟢 Más vendidos:', mostGroup);
    console.log('🟡 Regulares:', regularGroup);
    console.log('🔵 Ocasionales:', occasionalGroup);

    res.json({
      most: mostGroup,
      regular: regularGroup,
      occasional: occasionalGroup
    });


  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: err.message });
  }

});

module.exports = router;
