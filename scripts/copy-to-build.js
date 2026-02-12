const fs = require('fs');
const path = require('path');

/**
 * Copy standalone build output to build/ directory
 * This makes it easier to zip and deploy
 */

const sourceDir = path.join(__dirname, '..', '.next', 'standalone');
const targetDir = path.join(__dirname, '..', 'build');

console.log('📦 Copying standalone build to build/ directory...');

// Remove existing build directory if it exists
if (fs.existsSync(targetDir)) {
  console.log('🗑️  Removing existing build/ directory...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Create build directory
fs.mkdirSync(targetDir, { recursive: true });

// Copy standalone directory contents
console.log('📋 Copying files...');
copyRecursiveSync(sourceDir, targetDir);

// Also need to copy the static assets
const staticSource = path.join(__dirname, '..', '.next', 'static');
const staticTarget = path.join(targetDir, '.next', 'static');

if (fs.existsSync(staticSource)) {
  console.log('📋 Copying static assets...');
  fs.mkdirSync(path.dirname(staticTarget), { recursive: true });
  copyRecursiveSync(staticSource, staticTarget);
}

// Copy public directory if it exists
const publicSource = path.join(__dirname, '..', 'public');
const publicTarget = path.join(targetDir, 'public');

if (fs.existsSync(publicSource)) {
  console.log('📋 Copying public assets...');
  copyRecursiveSync(publicSource, publicTarget);
}

console.log('✅ Build copied to build/ directory successfully!');
console.log(`📁 Build location: ${targetDir}`);
console.log('🚀 Ready to deploy!');

/**
 * Recursively copy directory
 */
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
