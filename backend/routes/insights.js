const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/insights — Average protein, carbs, and fat by diet type
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();
    const { diet_type } = req.query;

    let filtered = recipes;
    if (diet_type && diet_type !== 'All Diet Types') {
      filtered = recipes.filter(r => r.diet_type.toLowerCase() === diet_type.toLowerCase());
    }

    // Group by diet_type and compute averages
    const groups = {};
    for (const r of filtered) {
      if (!groups[r.diet_type]) groups[r.diet_type] = { protein: 0, carbs: 0, fat: 0, count: 0 };
      groups[r.diet_type].protein += r.protein_g;
      groups[r.diet_type].carbs += r.carbs_g;
      groups[r.diet_type].fat += r.fat_g;
      groups[r.diet_type].count++;
    }

    const result = Object.keys(groups).sort().map(dt => ({
      diet_type: dt,
      avg_protein: (groups[dt].protein / groups[dt].count).toFixed(2),
      avg_carbs: (groups[dt].carbs / groups[dt].count).toFixed(2),
      avg_fat: (groups[dt].fat / groups[dt].count).toFixed(2),
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Failed to fetch nutritional insights' });
  }
});

module.exports = router;
