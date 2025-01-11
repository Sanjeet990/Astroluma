const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define directories
const appsDir = path.resolve(__dirname, 'apps');
const storageAppsDir = path.resolve(__dirname, '../storage/apps');

// Function to create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to copy directory
const copyDirectory = (source, destination) => {
  try {
    console.log(`Copying ${source} to ${destination}`);
    fs.cpSync(source, destination, { recursive: true });
    console.log('Directory copied successfully.');
  } catch (error) {
    console.error(`Failed to copy directory from ${source} to ${destination}`);
    console.error(error);
    throw error;
  }
};

// Function to install npm dependencies
const installDependencies = (moduleDir) => {
  try {
    console.log(`Installing dependencies for module at ${moduleDir}...`);
    execSync('npm install', { cwd: moduleDir, stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error(`Failed to install dependencies for module at ${moduleDir}`);
    console.error(error);
    throw error;
  }
};

// Main process
const main = async () => {
  try {
    // Ensure storage/apps directory exists
    ensureDirectoryExists(storageAppsDir);

    // Read the source apps directory
    const files = fs.readdirSync(appsDir);

    // Process each app
    files.forEach((file) => {
      const sourceModuleDir = path.join(appsDir, file);
      const destinationModuleDir = path.join(storageAppsDir, file);
      const sourcePackageJsonPath = path.join(sourceModuleDir, 'package.json');

      // Only process directories that contain package.json
      if (fs.existsSync(sourcePackageJsonPath)) {
        console.log(`Found package.json at ${sourcePackageJsonPath}`);
        
        // Copy the directory to storage/apps
        copyDirectory(sourceModuleDir, destinationModuleDir);
        
        // Install dependencies in the copied directory
        installDependencies(destinationModuleDir);
      } else {
        console.log(`No package.json found in ${sourceModuleDir}. Skipping.`);
      }
    });

    console.log('All operations completed successfully.');
  } catch (error) {
    console.error('An error occurred during processing:', error);
    process.exit(1);
  }
};

// Run the main process
main();