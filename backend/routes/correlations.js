const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/correlations — Correlation matrix between protein, carbs, and fat
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();

    if (recipes.length < 2) {
      return res.json({ correlation_matrix: null, message: 'Not enough data' });
    }

    const protein = recipes.map(r => r.protein_g);
    const carbs = recipes.map(r => r.carbs_g);
    const fat = recipes.map(r => r.fat_g);

    function pearson(x, y) {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      const sumY2 = y.reduce((a, b) => a + b * b, 0);
      const num = n * sumXY - sumX * sumY;
      const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      return den === 0 ? 0 : Math.round((num / den) * 10000) / 10000;
    }

    const matrix = {
      labels: ['Protein', 'Carbs', 'Fat'],
      values: [
        [1, pearson(protein, carbs), pearson(protein, fat)],
        [pearson(carbs, protein), 1, pearson(carbs, fat)],
        [pearson(fat, protein), pearson(fat, carbs), 1],
      ],
    };

    res.json(matrix);
  } catch (err) {
    console.error('Error fetching correlations:', err);
    res.status(500).json({ error: 'Failed to compute correlations' });
  }
});

module.exports = router;
