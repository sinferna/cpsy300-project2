const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const pool = require('./db');

async function seed() {
  console.log('Creating recipes table...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      diet_type VARCHAR(100) NOT NULL,
      recipe_name VARCHAR(255) NOT NULL,
      cuisine_type VARCHAR(100),
      protein_g NUMERIC(8,2),
      carbs_g NUMERIC(8,2),
      fat_g NUMERIC(8,2),
      extraction_day VARCHAR(20),
      extraction_time VARCHAR(20)
    );
  `);

  // Check if data already exists
  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM recipes');
  if (existing.rows[0].count > 0) {
    console.log(`Table already has ${existing.rows[0].count} rows. Skipping seed.`);
    await pool.end();
    return;
  }

  // Read and parse CSV
  const csvPath = path.join(__dirname, 'data', 'recipes.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    console.error('Place your dataset CSV file at backend/data/recipes.csv');
    await pool.end();
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${records.length} records from CSV`);

  // Insert in batches
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const values = [];
    const placeholders = [];

    batch.forEach((row, idx) => {
      const base = idx * 8;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
      );
      values.push(
        row.Diet_type || row.diet_type || '',
        row.Recipe_name || row.recipe_name || '',
        row.Cuisine_type || row.cuisine_type || '',
        parseFloat(row['Protein(g)'] || row.Protein_g || row.protein_g || 0),
        parseFloat(row['Carbs(g)'] || row.Carbs_g || row.carbs_g || 0),
        parseFloat(row['Fat(g)'] || row.Fat_g || row.fat_g || 0),
        row.Extraction_day || row.extraction_day || '',
        row.Extraction_time || row.extraction_time || ''
      );
    });

    await pool.query(
      `INSERT INTO recipes (diet_type, recipe_name, cuisine_type, protein_g, carbs_g, fat_g, extraction_day, extraction_time)
       VALUES ${placeholders.join(', ')}`,
      values
    );

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${records.length} rows...`);
  }

  console.log('Seeding complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
