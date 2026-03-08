const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/distribution — Recipe count per diet type (for pie chart)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT diet_type, COUNT(*)::int AS count
      FROM recipes
      GROUP BY diet_type
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching distribution:', err);
    res.status(500).json({ error: 'Failed to fetch distribution data' });
  }
});

module.exports = router;
