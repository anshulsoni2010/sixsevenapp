#!/usr/bin/env node

/**
 * Swagger Documentation Checker
 *
 * This script checks if swagger documentation is up to date
 * by comparing the last modified time of API route files vs swagger.json
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'app', 'api');
const SWAGGER_FILE = path.join(__dirname, '..', 'public', 'swagger.json');

function getAllApiFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllApiFiles(fullPath, files);
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }

  return files;
}

function checkSwaggerUpToDate() {
  try {
    // Get all API route files
    const apiFiles = getAllApiFiles(API_DIR);

    // Get swagger.json modification time
    let swaggerMtime = 0;
    if (fs.existsSync(SWAGGER_FILE)) {
      swaggerMtime = fs.statSync(SWAGGER_FILE).mtime.getTime();
    }

    // Check if any API file is newer than swagger.json
    const outdatedFiles = [];
    for (const file of apiFiles) {
      const fileMtime = fs.statSync(file).mtime.getTime();
      if (fileMtime > swaggerMtime) {
        outdatedFiles.push(path.relative(path.join(__dirname, '..'), file));
      }
    }

    if (outdatedFiles.length > 0) {
      console.log('⚠️  Swagger documentation may be outdated!');
      console.log('The following API files have been modified since the last swagger generation:');
      outdatedFiles.forEach(file => console.log(`  - ${file}`));
      console.log('\nRun: npm run generate-swagger');
      console.log('Then: npm run dev');
      console.log('Visit: http://localhost:3000/api/docs');
      process.exit(1);
    } else {
      console.log('✅ Swagger documentation is up to date!');
    }
  } catch (error) {
    console.error('Error checking swagger status:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkSwaggerUpToDate();
}

module.exports = { checkSwaggerUpToDate };