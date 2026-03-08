const { BlobServiceClient } = require('@azure/storage-blob');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let recipes = null;

async function loadData() {
  if (recipes) return recipes;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_CONTAINER_NAME;
  const blobName = process.env.AZURE_BLOB_NAME;

  let csvContent;

  if (connectionString) {
    // Load from Azure Blob Storage
    console.log('Loading data from Azure Blob Storage...');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadResponse = await blobClient.download(0);
    csvContent = await streamToString(downloadResponse.readableStreamBody);
  } else {
    // Fallback to local CSV file
    console.log('No Azure connection string found. Loading from local CSV...');
    const csvPath = path.join(__dirname, 'data', 'recipes.csv');
    csvContent = fs.readFileSync(csvPath, 'utf-8');
  }

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  recipes = records.map((row, index) => ({
    id: index + 1,
    diet_type: row.Diet_type || row.diet_type || '',
    recipe_name: row.Recipe_name || row.recipe_name || '',
    cuisine_type: row.Cuisine_type || row.cuisine_type || '',
    protein_g: parseFloat(row['Protein(g)'] || row.Protein_g || row.protein_g || 0),
    carbs_g: parseFloat(row['Carbs(g)'] || row.Carbs_g || row.carbs_g || 0),
    fat_g: parseFloat(row['Fat(g)'] || row.Fat_g || row.fat_g || 0),
    extraction_day: row.Extraction_day || row.extraction_day || '',
    extraction_time: row.Extraction_time || row.extraction_time || '',
  }));

  console.log(`Loaded ${recipes.length} recipes`);
  return recipes;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

module.exports = { loadData };
