const express = require('express');
const router = express.Router();
const { loadData } = require('../data-loader');

// GET /api/clusters — K-Means clustering of recipes by macros (protein, carbs, fat)
router.get('/', async (req, res) => {
  try {
    const recipes = await loadData();
    const k = Math.min(10, Math.max(2, parseInt(req.query.k, 10) || 3));

    if (recipes.length < k) {
      return res.status(400).json({ error: 'Not enough data points for clustering' });
    }

    const data = recipes.map(r => [r.protein_g, r.carbs_g, r.fat_g]);

    const mins = [0, 1, 2].map(i => Math.min(...data.map(d => d[i])));
    const maxs = [0, 1, 2].map(i => Math.max(...data.map(d => d[i])));
    const ranges = maxs.map((max, i) => max - mins[i] || 1);

    const normalized = data.map(d => d.map((v, i) => (v - mins[i]) / ranges[i]));

    const clusters = kMeans(normalized, k, 50);

    const clustered = recipes.map((row, i) => ({
      id: row.id,
      recipe_name: row.recipe_name,
      diet_type: row.diet_type,
      protein_g: row.protein_g,
      carbs_g: row.carbs_g,
      fat_g: row.fat_g,
      cluster: clusters.assignments[i],
    }));

    const centroids = clusters.centroids.map(c =>
      c.map((v, i) => Math.round((v * ranges[i] + mins[i]) * 100) / 100)
    );

    res.json({
      k,
      centroids: centroids.map((c, i) => ({
        cluster: i,
        protein_g: c[0],
        carbs_g: c[1],
        fat_g: c[2],
      })),
      data: clustered,
    });
  } catch (err) {
    console.error('Error computing clusters:', err);
    res.status(500).json({ error: 'Failed to compute clusters' });
  }
});

function kMeans(data, k, maxIter) {
  const n = data.length;
  const dims = data[0].length;

  const indices = new Set();
  while (indices.size < k) {
    indices.add(Math.floor(Math.random() * n));
  }
  let centroids = [...indices].map(i => [...data[i]]);
  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = data.map(point => {
      let minDist = Infinity;
      let best = 0;
      for (let c = 0; c < k; c++) {
        const dist = euclidean(point, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          best = c;
        }
      }
      return best;
    });

    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;

    if (!changed) break;

    centroids = Array.from({ length: k }, (_, c) => {
      const members = data.filter((_, i) => assignments[i] === c);
      if (members.length === 0) return centroids[c];
      return Array.from({ length: dims }, (_, d) =>
        members.reduce((sum, p) => sum + p[d], 0) / members.length
      );
    });
  }

  return { centroids, assignments };
}

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

module.exports = router;
