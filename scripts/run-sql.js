// Simple script to run SQL files using the database connection
const { config } = require('dotenv');
const { readFileSync } = require('fs');
const { Pool } = require('pg');
const { join } = require('path');

// Load environment variables
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSQL(filePath, description) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  try {
    const sql = readFileSync(filePath, 'utf-8');
    console.log(`\n📝 ${description}...`);
    await pool.query(sql);
    console.log(`✅ ${description} completed successfully!\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'fix') {
      await runSQL(
        join(__dirname, 'fix-position-column.sql'),
        'Running column rename fix'
      );
    } else if (command === 'migrate') {
      await runSQL(
        join(__dirname, 'drizzle', '0000_heavy_amphibian.sql'),
        'Running migration'
      );
    } else if (command === 'all') {
      await runSQL(
        join(__dirname, 'fix-position-column.sql'),
        'Running column rename fix'
      );
      await runSQL(
        join(__dirname, 'drizzle', '0000_heavy_amphibian.sql'),
        'Running migration'
      );
    } else {
      console.log(`
Usage: node run-sql.js [command]

Commands:
  fix     - Run the column rename fix only
  migrate - Run the full migration only
  all     - Run both fix and migration (recommended)

Examples:
  node run-sql.js fix
  node run-sql.js migrate
  node run-sql.js all
      `);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

main();
