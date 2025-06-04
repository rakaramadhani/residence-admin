#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🎨 Formatting code...');

try {
  // Install prettier if not already installed
  console.log('📦 Installing Prettier...');
  execSync('npm install --save-dev prettier', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // Format with Prettier
  console.log('✨ Running Prettier...');
  execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // Fix ESLint issues
  console.log('🔧 Fixing ESLint issues...');
  execSync('npm run lint:fix', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Code formatting complete!');
} catch (error) {
  console.error('❌ Error formatting code:', error.message);
  process.exit(1);
} 