const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupMySQL() {
  console.log('🚀 MySQL Setup for BookReader');
  console.log('==============================\n');

  try {
    // Check if MySQL is installed
    console.log('1. Checking MySQL installation...');
    try {
      execSync('mysql --version', { stdio: 'pipe' });
      console.log('✅ MySQL is installed');
    } catch (error) {
      console.log('❌ MySQL is not installed or not in PATH');
      console.log('Please install MySQL first: https://dev.mysql.com/downloads/mysql/');
      process.exit(1);
    }

    // Check if Node.js dependencies are installed
    console.log('\n2. Checking Node.js dependencies...');
    if (!fs.existsSync('node_modules')) {
      console.log('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      console.log('✅ Dependencies are installed');
    }

    // Get MySQL configuration
    console.log('\n3. MySQL Configuration');
    const host = await question('MySQL Host (default: localhost): ') || 'localhost';
    const port = await question('MySQL Port (default: 3306): ') || '3306';
    const user = await question('MySQL Username (default: root): ') || 'root';
    const password = await question('MySQL Password: ');
    const database = await question('Database Name (default: bookreader): ') || 'bookreader';

    // Create environment file
    console.log('\n4. Creating environment configuration...');
    const envContent = `# MySQL Database Configuration
MYSQL_HOST=${host}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
MYSQL_DATABASE=${database}
MYSQL_PORT=${port}

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
`;

    fs.writeFileSync('mysql-config.env', envContent);
    console.log('✅ Environment configuration created');

    // Test MySQL connection
    console.log('\n5. Testing MySQL connection...');
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host,
        port: parseInt(port),
        user,
        password,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
      });

      // Create database if it doesn't exist
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('✅ Database created/verified');
      await connection.end();
    } catch (error) {
      console.log('❌ Failed to connect to MySQL:', error.message);
      console.log('Please check your MySQL credentials and try again');
      process.exit(1);
    }

    // Run migration
    console.log('\n6. Running data migration...');
    try {
      execSync('npm run migrate-to-mysql', { stdio: 'inherit' });
      console.log('✅ Data migration completed');
    } catch (error) {
      console.log('❌ Migration failed:', error.message);
      process.exit(1);
    }

    // Create start script
    console.log('\n7. Creating start script...');
    const startScript = `#!/bin/bash
# Start BookReader with MySQL backend
echo "Starting BookReader with MySQL backend..."
echo "Database: ${database}"
echo "Host: ${host}:${port}"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"

# Load environment variables
export $(cat mysql-config.env | xargs)

# Start the server
node server-mysql.js
`;

    fs.writeFileSync('start-mysql.sh', startScript);
    fs.chmodSync('start-mysql.sh', '755');
    console.log('✅ Start script created: start-mysql.sh');

    // Create package.json script
    console.log('\n8. Updating package.json...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.scripts['start-mysql']) {
      packageJson.scripts['start-mysql'] = 'node server-mysql.js';
    }
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json updated');

    console.log('\n🎉 MySQL Setup Complete!');
    console.log('========================');
    console.log('');
    console.log('To start the server with MySQL:');
    console.log('  npm run start-mysql');
    console.log('  or');
    console.log('  ./start-mysql.sh');
    console.log('');
    console.log('To start the original SQLite server:');
    console.log('  npm run server');
    console.log('');
    console.log('Configuration file: mysql-config.env');
    console.log('MySQL Schema: mysql-schema.sql');
    console.log('Migration script: mysql-migration.js');
    console.log('MySQL Server: server-mysql.js');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupMySQL();
}

module.exports = { setupMySQL };
