const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to SQLite backend...');

// Restore SQLite App.js from backup
const appJsPath = path.join(__dirname, 'src', 'App.js');
const backupPath = path.join(__dirname, 'src', 'App-SQLite-backup.js');

if (fs.existsSync(backupPath)) {
  fs.copyFileSync(backupPath, appJsPath);
  console.log('✅ Restored SQLite App.js from backup');
} else {
  console.log('⚠️  No SQLite backup found, using default App.js');
}

// Update package.json scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove MySQL-specific scripts
  const { 'start-mysql': _, 'dev-mysql': __, 'switch-to-mysql': ___, 'switch-to-sqlite': ____, ...restScripts } = packageJson.scripts;
  
  packageJson.scripts = {
    ...restScripts,
    'switch-to-mysql': 'node switch-to-mysql.js'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts');
}

console.log('\n🎉 Successfully switched to SQLite backend!');
console.log('\n📋 Next steps:');
console.log('1. Start the SQLite server: npm run server');
console.log('2. Start the React app: npm start');
console.log('3. The app will now use the local SQLite database');
console.log('\n💡 To switch to MySQL, run: npm run switch-to-mysql');

