const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/scatter — Protein vs carbs data for scatter plot
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();
    const { diet_type } = req.query;

    let filtered = recipes;
    if (diet_type && diet_type !== 'All Diet Types') {
      filtered = recipes.filter(r => r.diet_type.toLowerCase() === diet_type.toLowerCase());
    }

    const result = filtered.map(r => ({
      recipe_name: r.recipe_name,
      diet_type: r.diet_type,
      protein_g: r.protein_g,
      carbs_g: r.carbs_g,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching scatter data:', err);
    res.status(500).json({ error: 'Failed to fetch scatter plot data' });
  }
});

module.exports = router;
