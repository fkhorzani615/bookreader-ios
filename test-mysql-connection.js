const mysql = require('mysql2/promise');
const fs = require('fs');

// Load environment variables
function loadEnv() {
  const envPath = 'mysql-config.env';
  if (!fs.existsSync(envPath)) {
    console.log('❌ mysql-config.env not found. Please run setup first.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      env[key.trim()] = value.trim();
    }
  });

  return env;
}

async function testMySQLConnection() {
  console.log('🔍 Testing MySQL Connection for BookReader');
  console.log('==========================================\n');

  try {
    const env = loadEnv();
    
    console.log('1. Testing database connection...');
    const connection = await mysql.createConnection({
      host: env.MYSQL_HOST || 'localhost',
      port: parseInt(env.MYSQL_PORT) || 3306,
      user: env.MYSQL_USER || 'root',
      password: env.MYSQL_PASSWORD || '',
      database: env.MYSQL_DATABASE || 'bookreader',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    });

    console.log('✅ Database connection successful');

    // Test basic queries
    console.log('\n2. Testing table queries...');
    
    // Check if tables exist
    const tables = ['users', 'books', 'videos', 'categories', 'orders', 'order_items', 'user_sessions', 'password_reset_tokens'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table} table: ${rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table} table: ${error.message}`);
      }
    }

    // Test sample queries
    console.log('\n3. Testing sample queries...');
    
    // Get featured books
    try {
      const [books] = await connection.execute('SELECT COUNT(*) as count FROM books WHERE featured = 1');
      console.log(`✅ Featured books: ${books[0].count}`);
    } catch (error) {
      console.log(`❌ Featured books query failed: ${error.message}`);
    }

    // Get featured videos
    try {
      const [videos] = await connection.execute('SELECT COUNT(*) as count FROM videos WHERE featured = 1');
      console.log(`✅ Featured videos: ${videos[0].count}`);
    } catch (error) {
      console.log(`❌ Featured videos query failed: ${error.message}`);
    }

    // Get categories
    try {
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      console.log(`✅ Categories: ${categories[0].count}`);
    } catch (error) {
      console.log(`❌ Categories query failed: ${error.message}`);
    }

    // Test user authentication query
    console.log('\n4. Testing authentication queries...');
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      console.log(`✅ Active users: ${users[0].count}`);
    } catch (error) {
      console.log(`❌ Users query failed: ${error.message}`);
    }

    await connection.end();
    
    console.log('\n🎉 MySQL Connection Test Complete!');
    console.log('===================================');
    console.log('');
    console.log('If all tests passed, your MySQL setup is working correctly.');
    console.log('');
    console.log('To start the server:');
    console.log('  npm run server-mysql');
    console.log('  or');
    console.log('  npm run start-mysql');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your mysql-config.env file');
    console.log('3. Verify database credentials');
    console.log('4. Run setup again: npm run setup-mysql-interactive');
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMySQLConnection();
}

module.exports = { testMySQLConnection };
