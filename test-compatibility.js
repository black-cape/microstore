#!/usr/bin/env node

/**
 * Test script to verify React 18/19 compatibility
 *
 * This script can be run to test the library with different React versions:
 * npm install react@18 react-dom@18 && node test-compatibility.js
 * npm install react@19 react-dom@19 && node test-compatibility.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getReactVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./node_modules/react/package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    return 'Not installed';
  }
}

function testBuild() {
  try {
    console.log('🔧 Building library...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful!');
    return true;
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    return false;
  }
}

function testTypeCheck() {
  try {
    console.log('🔍 Type checking...');
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ Type check passed!');
    return true;
  } catch (error) {
    console.log('❌ Type check failed:', error.message);
    return false;
  }
}

console.log('🧪 Testing MicroStore React Compatibility');
console.log('=====================================');

const reactVersion = getReactVersion();
console.log(`📦 React version: ${reactVersion}`);

if (reactVersion.startsWith('18.')) {
  console.log('✅ Testing with React 18');
} else if (reactVersion.startsWith('19.')) {
  console.log('✅ Testing with React 19');
} else {
  console.log('⚠️  Unknown React version detected');
}

console.log('');

const buildSuccess = testBuild();
console.log('');

const typeCheckSuccess = testTypeCheck();
console.log('');

if (buildSuccess && typeCheckSuccess) {
  console.log(`🎉 MicroStore is compatible with React ${reactVersion}!`);
  process.exit(0);
} else {
  console.log(`💥 Compatibility issues detected with React ${reactVersion}`);
  process.exit(1);
}
