const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
