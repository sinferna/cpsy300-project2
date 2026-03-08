const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/insights — Average protein, carbs, and fat by diet type
router.get('/', async (req, res) => {
  try {
    const { diet_type } = req.query;

    let query = `
      SELECT
        diet_type,
        ROUND(AVG(protein_g)::numeric, 2) AS avg_protein,
        ROUND(AVG(carbs_g)::numeric, 2)   AS avg_carbs,
        ROUND(AVG(fat_g)::numeric, 2)     AS avg_fat
      FROM recipes
    `;
    const params = [];

    if (diet_type && diet_type !== 'All Diet Types') {
      query += ' WHERE LOWER(diet_type) = LOWER($1)';
      params.push(diet_type);
    }

    query += ' GROUP BY diet_type ORDER BY diet_type';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Failed to fetch nutritional insights' });
  }
});

module.exports = router;
