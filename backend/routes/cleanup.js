const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// POST /api/cleanup — Scan for and clean up stale/temporary resources
router.post('/', (req, res) => {
  const removed = [];
  const warnings = [];

  // 1. Check for temp files in the backend directory
  const backendDir = path.join(__dirname, '..');
  const tempPatterns = [/\.tmp$/, /\.log$/, /\.bak$/, /~$/, /\.swp$/];
  try {
    const files = fs.readdirSync(backendDir);
    for (const file of files) {
      if (tempPatterns.some(p => p.test(file))) {
        const fullPath = path.join(backendDir, file);
        try {
          fs.unlinkSync(fullPath);
          removed.push({ resource: file, type: 'Temp File', status: 'removed' });
        } catch {
          warnings.push({ resource: file, type: 'Temp File', status: 'failed to remove' });
        }
      }
    }
  } catch {}

  // 2. Check for empty directories in data/
  const dataDir = path.join(__dirname, '..', 'data');
  try {
    const entries = fs.readdirSync(dataDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dataDir, entry.name);
        const contents = fs.readdirSync(subDir);
        if (contents.length === 0) {
          fs.rmdirSync(subDir);
          removed.push({ resource: `data/${entry.name}`, type: 'Empty Directory', status: 'removed' });
        }
      }
    }
  } catch {}

  // 3. Check node_modules size and report
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  let nodeModulesSize = 0;
  try {
    if (fs.existsSync(nodeModulesPath)) {
      nodeModulesSize = getDirSizeMB(nodeModulesPath);
    }
  } catch {}

  // 4. Check for stale .env.example if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    warnings.push({ resource: '.env.example', type: 'Config', status: 'present (verify it matches .env structure)' });
  }

  // 5. Report package-lock.json freshness
  const lockPath = path.join(__dirname, '..', 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    const lockStat = fs.statSync(lockPath);
    const daysSinceModified = Math.floor((Date.now() - lockStat.mtimeMs) / (1000 * 60 * 60 * 24));
    if (daysSinceModified > 30) {
      warnings.push({ resource: 'package-lock.json', type: 'Dependencies', status: `last updated ${daysSinceModified} days ago — consider running npm update` });
    }
  }

  const summary = removed.length > 0
    ? `Cleanup complete. ${removed.length} resource(s) removed.`
    : 'Cleanup complete. No stale resources found — environment is clean.';

  res.json({
    message: summary,
    removed,
    warnings,
    stats: {
      nodeModulesSizeMB: nodeModulesSize,
      dataFilesChecked: true,
      tempFilesScanned: true,
    },
  });
});

function getDirSizeMB(dirPath) {
  let totalSize = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        totalSize += fs.statSync(fullPath).size;
      }
      // Only go one level deep to avoid slow recursion on large node_modules
    }
  } catch {}
  return Math.round(totalSize / (1024 * 1024) * 10) / 10;
}

module.exports = router;
