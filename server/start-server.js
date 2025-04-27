const runMigrations = require('./scripts/run-migrations');

// Run migrations first
runMigrations()
  .then(() => {
    console.log('Migrations completed, starting server...');
    // Start the server after migrations complete
    require('./server.js');
  })
  .catch((error) => {
    console.error('Migration error:', error);
    // Start the server anyway, even if migrations fail
    console.log('Starting server despite migration issues...');
    require('./server.js');
  });
