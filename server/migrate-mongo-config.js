// In this file you can configure migrate-mongo
require('dotenv').config()

const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/astroluma",

    options: {
      connectTimeoutMS: 10000, // Set connection timeout to 10 seconds
      socketTimeoutMS: 10000,  // Set socket timeout to 10 seconds
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
