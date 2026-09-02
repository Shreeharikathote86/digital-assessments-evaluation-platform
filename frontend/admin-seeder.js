/**
 * Admin Seeder Script
 * This script redirects to the backend admin-seeder.js
 */

console.log("Redirecting to backend admin-seeder.js...");

const { exec } = require('child_process');
const path = require('path');

// Get the path to the backend directory
const backendPath = path.resolve(__dirname, '../backend');
const adminSeederPath = path.join(backendPath, 'admin-seeder.js');

console.log(`Executing admin seeder at: ${adminSeederPath}`);

// Execute the backend admin-seeder.js
exec(`node ${adminSeederPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`${stdout}`);
});
