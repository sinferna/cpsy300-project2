const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/distribution — Recipe count per diet type (for pie chart)
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();

    const counts = {};
    for (const r of recipes) {
      counts[r.diet_type] = (counts[r.diet_type] || 0) + 1;
    }

    const result = Object.entries(counts)
      .map(([diet_type, count]) => ({ diet_type, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (err) {
    console.error('Error fetching distribution:', err);
    res.status(500).json({ error: 'Failed to fetch distribution data' });
  }
});

module.exports = router;
