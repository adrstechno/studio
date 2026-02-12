// Test script to verify Electron configuration
require('dotenv').config({ path: '.env.electron' });
const config = require('./electron.config');

console.log('\n' + '='.repeat(60));
console.log('ELECTRON CONFIGURATION TEST');
console.log('='.repeat(60));

console.log('\n📋 Environment Variables:');
console.log('  ELECTRON_PRODUCTION_URL:', process.env.ELECTRON_PRODUCTION_URL);
console.log('  ELECTRON_DEVELOPMENT_URL:', process.env.ELECTRON_DEVELOPMENT_URL);
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');

console.log('\n🔧 Config Object:');
console.log('  Development URL:', config.urls.development);
console.log('  Production URL:', config.urls.production);

console.log('\n🎯 URL Selection Logic:');
const isDev = process.env.NODE_ENV === "development";
const selectedUrl = isDev ? config.urls.development : config.urls.production;
console.log('  isDev:', isDev);
console.log('  Selected URL:', selectedUrl);

console.log('\n✅ Expected Behavior:');
console.log('  When NODE_ENV is "development" → Use:', config.urls.development);
console.log('  When NODE_ENV is NOT "development" → Use:', config.urls.production);
console.log('  When building .exe (no NODE_ENV) → Use:', config.urls.production);

console.log('\n🚀 Current Mode:');
if (isDev) {
  console.log('  ⚠️  DEVELOPMENT MODE - Will use:', config.urls.development);
} else {
  console.log('  ✅ PRODUCTION MODE - Will use:', config.urls.production);
}

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60) + '\n');
