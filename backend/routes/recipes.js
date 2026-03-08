const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/recipes — Paginated recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const { diet_type, search } = req.query;

    let whereClause = '';
    const params = [];
    const conditions = [];

    if (diet_type && diet_type !== 'All Diet Types') {
      params.push(diet_type);
      conditions.push(`LOWER(diet_type) = LOWER($${params.length})`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(LOWER(recipe_name) LIKE LOWER($${params.length}) OR LOWER(diet_type) LIKE LOWER($${params.length}))`);
    }

    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM recipes${whereClause}`,
      params
    );
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated rows
    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT id, diet_type, recipe_name, cuisine_type, protein_g, carbs_g, fat_g, extraction_day, extraction_time
       FROM recipes${whereClause}
       ORDER BY id
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: dataResult.rows,
    });
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

module.exports = router;
