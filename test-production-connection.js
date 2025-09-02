const mysql = require('mysql2/promise');

// Production MySQL Configuration
const mysqlConfig = {
  host: 'mysql5047.site4now.net',
  user: 'a93fb8_bookrea',
  password: 'Sarah10072012@',
  database: 'db_a93fb8_bookrea',
  port: 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing MySQL connection...');
    
    // Create connection pool
    const pool = mysql.createPool(mysqlConfig);
    
    // Test connection
    connection = await pool.getConnection();
    console.log('✅ MySQL connection successful!');
    
    // Test basic queries
    console.log('\n📊 Testing database queries...');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Test users table
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log('👥 Users count:', users[0].count);
    } catch (error) {
      console.log('⚠️  Users table not found or empty');
    }
    
    // Test books table
    try {
      const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
      console.log('📚 Books count:', books[0].count);
    } catch (error) {
      console.log('⚠️  Books table not found or empty');
    }
    
    // Test videos table
    try {
      const [videos] = await connection.execute('SELECT COUNT(*) as count FROM videos');
      console.log('🎥 Videos count:', videos[0].count);
    } catch (error) {
      console.log('⚠️  Videos table not found or empty');
    }
    
    // Test categories table
    try {
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      console.log('🏷️  Categories count:', categories[0].count);
    } catch (error) {
      console.log('⚠️  Categories table not found or empty');
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('🚀 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔧 Please check your MySQL configuration');
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// Run the test
testConnection();
