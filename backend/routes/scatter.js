const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/scatter — Protein vs carbs data for scatter plot
router.get('/', async (req, res) => {
  try {
    const { diet_type } = req.query;

    let query = `
      SELECT recipe_name, diet_type, protein_g, carbs_g
      FROM recipes
    `;
    const params = [];

    if (diet_type && diet_type !== 'All Diet Types') {
      query += ' WHERE LOWER(diet_type) = LOWER($1)';
      params.push(diet_type);
    }

    query += ' ORDER BY recipe_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching scatter data:', err);
    res.status(500).json({ error: 'Failed to fetch scatter plot data' });
  }
});

module.exports = router;
