const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const command = process.argv[2] || 'dev';
const targetDirName = command === 'build' ? 'e-bhoomi-next-build' : 'e-bhoomi-next';
const targetDir = path.join(process.env.TEMP || 'C:\\Users\\rahul\\AppData\\Local\\Temp', targetDirName);
const sourceDir = path.resolve(__dirname, '..');

console.log(`Syncing e-Bhoomi workspace to runtime directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Clean old build cache if building in dedicated build directory
if (command === 'build') {
  const nextCache = path.join(targetDir, '.next');
  if (fs.existsSync(nextCache)) {
    try {
      fs.rmSync(nextCache, { recursive: true, force: true });
    } catch (e) {
      // Ignore cache rm error
    }
  }
}

// Copy items, excluding src/pages and old .jsx files
const itemsToCopy = ['app', 'public', 'package.json', 'package-lock.json', 'next.config.mjs', 'tsconfig.json', 'next-env.d.ts', 'docs', 'scripts', '.eslintrc.json', '.env.local', '.env.example', 'firestore.rules', 'storage.rules', 'firebase.json', 'firestore.indexes.json'];

itemsToCopy.forEach((item) => {
  const srcPath = path.join(sourceDir, item);
  const destPath = path.join(targetDir, item);
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
  }
});

// Selectively copy src (components, services, types, data, styles) while excluding legacy pages directory and .jsx files
const srcSource = path.join(sourceDir, 'src');
const srcDest = path.join(targetDir, 'src');
if (fs.existsSync(srcSource)) {
  fs.cpSync(srcSource, srcDest, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(srcSource, src);
      if (rel.startsWith('pages') || rel === 'pages') return false;
      if (src.endsWith('.jsx')) return false;
      return true;
    }
  });
}

// Clean up any legacy src/pages in target directory if present
const targetPages = path.join(targetDir, 'src', 'pages');
if (fs.existsSync(targetPages)) {
  try {
    fs.rmSync(targetPages, { recursive: true, force: true });
  } catch (err) {
    // Ignore cleanup error
  }
}

const targetNodeModules = path.join(targetDir, 'node_modules');
if (
  !fs.existsSync(targetNodeModules) || 
  !fs.existsSync(path.join(targetNodeModules, 'firebase')) ||
  !fs.existsSync(path.join(targetNodeModules, 'firebase-admin')) ||
  !fs.existsSync(path.join(targetNodeModules, 'nodemailer'))
) {
  console.log('Installing dependencies in target runtime directory...');
  spawnSync('npm.cmd', ['install', '--no-fund', '--no-audit'], { cwd: targetDir, stdio: 'inherit', shell: true });
}

console.log(`Executing: npx next ${command}`);
const child = spawnSync('npx.cmd', ['next', command, ...(command === 'dev' ? ['-p', '3000'] : [])], {
  cwd: targetDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: command === 'build' ? 'production' : 'development' }
});

process.exit(child.status || 0);
