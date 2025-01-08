const { exec } = require('child_process');

exec('migrate-mongo up', (err, stdout, stderr) => {
  if (err) {
    console.error("Migration failed: ", stderr);
  } else {
    console.log("Migration completed.", stdout);
  }

  // Start the server regardless of migration result
  require('./server.js');
});
