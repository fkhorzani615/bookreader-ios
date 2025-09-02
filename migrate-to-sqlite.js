#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Firebase to SQLite Migration...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Step 1: Install dependencies
console.log('📦 Installing SQLite dependencies...');
try {
  execSync('npm install bcryptjs jsonwebtoken sqlite sqlite3', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'src', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory\n');
}

// Step 3: Check if SQLite files exist
const requiredFiles = [
  'src/database/schema.sql',
  'src/database/database.js',
  'src/database/migrate.js',
  'src/context/SQLiteAuthContext.js',
  'src/context/SQLiteBooksContext.js',
  'src/context/SQLiteVideosContext.js',
  'src/App-SQLite.js',
  'src/pages/Login-SQLite.js',
  'src/pages/Register-SQLite.js'
];

console.log('🔍 Checking for required SQLite files...');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`);
  console.error('\nPlease ensure all SQLite migration files are present before running this script.');
  process.exit(1);
}

console.log('✅ All required files found\n');

// Step 4: Backup original files
console.log('💾 Creating backups of original files...');
const backupDir = path.join(__dirname, 'backup-firebase');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const filesToBackup = [
  'src/App.js',
  'src/pages/Login.js',
  'src/pages/Register.js',
  'src/context/AuthContext.js',
  'src/context/books.js'
];

filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, backupPath);
    console.log(`   ✅ Backed up ${file}`);
  }
});

console.log('✅ Backups created successfully\n');

// Step 5: Replace files with SQLite versions
console.log('🔄 Replacing files with SQLite versions...');

const replacements = [
  { from: 'src/App-SQLite.js', to: 'src/App.js' },
  { from: 'src/pages/Login-SQLite.js', to: 'src/pages/Login.js' },
  { from: 'src/pages/Register-SQLite.js', to: 'src/pages/Register.js' }
];

replacements.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`   ✅ Replaced ${to}`);
  }
});

console.log('✅ Files replaced successfully\n');

// Step 6: Update package.json scripts
console.log('📝 Updating package.json...');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add migration script
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['migrate-data'] = 'node src/database/migrate.js';
  packageJson.scripts['setup-sqlite'] = 'node migrate-to-sqlite.js';
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with migration scripts\n');
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

// Step 7: Create .env template
console.log('🔧 Creating environment template...');
const envTemplate = `# SQLite Configuration
JWT_SECRET=your-secret-key-change-in-production

# Firebase Configuration (for data migration - optional)
# REACT_APP_FIREBASE_API_KEY=your-api-key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# REACT_APP_FIREBASE_APP_ID=your-app-id

# Other Configuration
REACT_APP_APP_NAME=StreamFlow
REACT_APP_APP_VERSION=1.0.0
`;

const envPath = path.join(__dirname, '.env.sqlite');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.sqlite template\n');
}

// Step 8: Final instructions
console.log('🎉 Migration setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Copy .env.sqlite to .env and update the JWT_SECRET');
console.log('2. If you have Firebase data to migrate, run: npm run migrate-data');
console.log('3. Start the application: npm start');
console.log('4. Test user registration and login');
console.log('\n📚 For detailed instructions, see SQLITE_MIGRATION_GUIDE.md');
console.log('\n🔄 To rollback to Firebase, restore files from the backup-firebase directory');

// Check if .env exists and suggest updating
if (fs.existsSync('.env')) {
  console.log('\n⚠️  Note: You have an existing .env file. Consider updating it with SQLite configuration.');
}

console.log('\n✅ Migration setup complete!');
