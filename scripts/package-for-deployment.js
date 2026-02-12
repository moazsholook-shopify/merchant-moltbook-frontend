const fs = require('fs');
const path = require('path');

const BUILD_DIR = 'build';
const rootDir = path.join(__dirname, '..');
const buildDir = path.join(rootDir, BUILD_DIR);

console.log('📦 Packaging app for deployment...\n');

// Clean build directory
if (fs.existsSync(buildDir)) {
  console.log('🧹 Cleaning old build directory...');
  fs.rmSync(buildDir, { recursive: true });
}

// Create build directory
fs.mkdirSync(buildDir, { recursive: true });

// Copy standalone server
console.log('📋 Copying standalone server...');
const standaloneSrc = path.join(rootDir, '.next', 'standalone');
if (fs.existsSync(standaloneSrc)) {
  copyRecursive(standaloneSrc, buildDir);
} else {
  console.error('❌ Error: .next/standalone not found. Make sure next.config.mjs has output: "standalone"');
  process.exit(1);
}

// Copy static files
console.log('📋 Copying static files...');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(buildDir, '.next', 'static');
fs.mkdirSync(path.dirname(staticDest), { recursive: true });
if (fs.existsSync(staticSrc)) {
  copyRecursive(staticSrc, staticDest);
}

// Copy public folder
console.log('📋 Copying public assets...');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(buildDir, 'public');
if (fs.existsSync(publicSrc)) {
  copyRecursive(publicSrc, publicDest);
}

// Copy Dockerfile
console.log('📋 Copying Dockerfile...');
const dockerfileSrc = path.join(rootDir, 'Dockerfile');
const dockerfileDest = path.join(buildDir, 'Dockerfile');
if (fs.existsSync(dockerfileSrc)) {
  fs.copyFileSync(dockerfileSrc, dockerfileDest);
}

// Copy .dockerignore
const dockerignoreSrc = path.join(rootDir, '.dockerignore');
const dockerignoreDest = path.join(buildDir, '.dockerignore');
if (fs.existsSync(dockerignoreSrc)) {
  fs.copyFileSync(dockerignoreSrc, dockerignoreDest);
}

// Copy cloudbuild.yaml
console.log('📋 Copying Cloud Build config...');
const cloudbuildSrc = path.join(rootDir, 'cloudbuild.yaml');
const cloudbuildDest = path.join(buildDir, 'cloudbuild.yaml');
if (fs.existsSync(cloudbuildSrc)) {
  fs.copyFileSync(cloudbuildSrc, cloudbuildDest);
}

// Create deployment README
console.log('📋 Creating deployment instructions...');
const readme = `# Merchant Moltbook Frontend - Deployment Package

This directory contains a production-ready build of the frontend.

## Deployment to GCP Cloud Run

### Option 1: Using Cloud Build (Recommended)
\`\`\`bash
gcloud builds submit --config cloudbuild.yaml
\`\`\`

### Option 2: Direct Deploy
\`\`\`bash
gcloud run deploy merchant-moltbook-frontend \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --port 8080
\`\`\`

### Option 3: Using Docker
\`\`\`bash
# Build image
docker build -t merchant-moltbook-frontend .

# Tag for GCR
docker tag merchant-moltbook-frontend gcr.io/YOUR-PROJECT-ID/merchant-moltbook-frontend

# Push to GCR
docker push gcr.io/YOUR-PROJECT-ID/merchant-moltbook-frontend

# Deploy to Cloud Run
gcloud run deploy merchant-moltbook-frontend \\
  --image gcr.io/YOUR-PROJECT-ID/merchant-moltbook-frontend \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --port 8080
\`\`\`

## What's Included
- Standalone Next.js server (optimized for production)
- Static assets and public files
- Dockerfile for containerization
- Cloud Build configuration
- All necessary dependencies

## Configuration
The app runs on port 8080 by default (configured for Cloud Run).
Backend API URL is set in the environment or defaults to the GCP Cloud Run backend.
`;

fs.writeFileSync(path.join(buildDir, 'README.md'), readme);

console.log('\n✅ Package complete!');
console.log(`📦 Deployment package ready at: ${BUILD_DIR}/`);
console.log('\n📝 Next steps:');
console.log('   1. Send the build/ directory to your backend team');
console.log('   2. They can deploy using the instructions in build/README.md');

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
