const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to MySQL backend...');

// Backup current App.js
const appJsPath = path.join(__dirname, 'src', 'App.js');
const backupPath = path.join(__dirname, 'src', 'App-SQLite-backup.js');

if (fs.existsSync(appJsPath)) {
  fs.copyFileSync(appJsPath, backupPath);
  console.log('✅ Backed up current App.js to App-SQLite-backup.js');
}

// Copy MySQL version to App.js
const mysqlAppPath = path.join(__dirname, 'src', 'App-MySQL.js');
if (fs.existsSync(mysqlAppPath)) {
  fs.copyFileSync(mysqlAppPath, appJsPath);
  console.log('✅ Switched to MySQL backend');
} else {
  console.error('❌ App-MySQL.js not found');
  process.exit(1);
}

// Update package.json scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add MySQL-specific scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'start-mysql': 'node server-production.js',
    'dev-mysql': 'nodemon server-production.js',
    'switch-to-mysql': 'node switch-to-mysql.js',
    'switch-to-sqlite': 'node switch-to-sqlite.js'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with MySQL scripts');
}

console.log('\n🎉 Successfully switched to MySQL backend!');
console.log('\n📋 Next steps:');
console.log('1. Start the MySQL server: npm run start-mysql');
console.log('2. Start the React app: npm start');
console.log('3. The app will now connect to your remote MySQL database');
console.log('\n💡 To switch back to SQLite, run: npm run switch-to-sqlite');
