const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/recipes — Paginated recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { diet_type, search } = req.query;

    let filtered = recipes;

    if (diet_type && diet_type !== 'All Diet Types') {
      filtered = filtered.filter(r => r.diet_type.toLowerCase() === diet_type.toLowerCase());
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(r =>
        r.recipe_name.toLowerCase().includes(s) || r.diet_type.toLowerCase().includes(s)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    res.json({ page, limit, total, totalPages, data });
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

module.exports = router;
