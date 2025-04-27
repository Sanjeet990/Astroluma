'use strict';
const path = require('path');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');

// Import the Sequelize configuration
const config = require('../config/sequelize-config.js')['development'];

async function runMigrations() {
  // Initialize Sequelize with the configuration
  const sequelize = new Sequelize(config);

  // Configure Umzug with the migrations
  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, '..', 'migrations', 'sequelize-migrations', '*.js'),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully.');

    // Run pending migrations
    console.log('Running migrations...');
    await umzug.up();
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migrations if the script is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  });
}

module.exports = runMigrations;