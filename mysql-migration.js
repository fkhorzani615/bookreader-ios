const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Load environment variables from mysql-config.env
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

// Load environment variables
const env = loadEnv();

// MySQL Configuration
const mysqlConfig = {
  host: env.MYSQL_HOST || 'localhost',
  user: env.MYSQL_USER || 'root',
  password: env.MYSQL_PASSWORD || '',
  database: env.MYSQL_DATABASE || 'bookreader',
  port: parseInt(env.MYSQL_PORT) || 3306,
  charset: 'utf8mb4'
};

// SQLite database path
const sqlitePath = path.join(__dirname, 'bookreader.db');

async function migrateToMySQL() {
  let mysqlConnection;
  let sqliteDb;

  try {
    console.log('Starting migration from SQLite to MySQL...');

    // Connect to MySQL
    console.log('Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      port: mysqlConfig.port,
      charset: mysqlConfig.charset
    });
    
    // Create database if it doesn't exist
    await mysqlConnection.execute(`CREATE DATABASE IF NOT EXISTS ${mysqlConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await mysqlConnection.query(`USE ${mysqlConfig.database}`);

    // Read and execute MySQL schema
    console.log('Creating MySQL schema...');
    const schemaPath = path.join(__dirname, 'mysql-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await mysqlConnection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error('Error executing statement:', statement);
            console.error('Error:', error.message);
          }
        }
      }
    }

    // Connect to SQLite
    console.log('Connecting to SQLite...');
    sqliteDb = new Database(sqlitePath);

    // Migrate users
    console.log('Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      const insertUserQuery = `
        INSERT INTO users (
          id, email, password_hash, display_name, phone, location, bio,
          created_at, updated_at, subscription_plan, subscription_status,
          subscription_expires_at, watch_history, favorites, preferences,
          is_admin, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          password_hash = VALUES(password_hash),
          display_name = VALUES(display_name),
          phone = VALUES(phone),
          location = VALUES(location),
          bio = VALUES(bio),
          updated_at = VALUES(updated_at),
          subscription_plan = VALUES(subscription_plan),
          subscription_status = VALUES(subscription_status),
          subscription_expires_at = VALUES(subscription_expires_at),
          watch_history = VALUES(watch_history),
          favorites = VALUES(favorites),
          preferences = VALUES(preferences),
          is_admin = VALUES(is_admin),
          is_active = VALUES(is_active)
      `;

      await mysqlConnection.execute(insertUserQuery, [
        user.id,
        user.email,
        user.password_hash,
        user.display_name,
        user.phone,
        user.location,
        user.bio,
        user.created_at,
        user.updated_at,
        user.subscription_plan,
        user.subscription_status,
        user.subscription_expires_at,
        user.watch_history,
        user.favorites,
        user.preferences,
        user.is_admin,
        user.is_active
      ]);
    }

    // Migrate books
    console.log('Migrating books...');
    const books = sqliteDb.prepare('SELECT * FROM books').all();
    for (const book of books) {
      const insertBookQuery = `
        INSERT INTO books (
          id, title, author, description, category, cover, pages, rating, price,
          is_public, featured, user_id, user_name, team_id, image_file_path,
          audio_file_path, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          author = VALUES(author),
          description = VALUES(description),
          category = VALUES(category),
          cover = VALUES(cover),
          pages = VALUES(pages),
          rating = VALUES(rating),
          price = VALUES(price),
          is_public = VALUES(is_public),
          featured = VALUES(featured),
          user_id = VALUES(user_id),
          user_name = VALUES(user_name),
          team_id = VALUES(team_id),
          image_file_path = VALUES(image_file_path),
          audio_file_path = VALUES(audio_file_path),
          updated_at = VALUES(updated_at)
      `;

      await mysqlConnection.execute(insertBookQuery, [
        book.id,
        book.title,
        book.author,
        book.description,
        book.category,
        book.cover,
        book.pages,
        book.rating,
        book.price,
        book.is_public,
        book.featured,
        book.user_id,
        book.user_name,
        book.team_id,
        book.image_file_path,
        book.audio_file_path,
        book.created_at,
        book.updated_at
      ]);
    }

    // Migrate videos
    console.log('Migrating videos...');
    const videos = sqliteDb.prepare('SELECT * FROM videos').all();
    for (const video of videos) {
      const insertVideoQuery = `
        INSERT INTO videos (
          id, title, instructor, description, category, thumbnail, video_url,
          duration, rating, views, is_public, featured, user_id, user_name,
          team_id, video_file_path, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          instructor = VALUES(instructor),
          description = VALUES(description),
          category = VALUES(category),
          thumbnail = VALUES(thumbnail),
          video_url = VALUES(video_url),
          duration = VALUES(duration),
          rating = VALUES(rating),
          views = VALUES(views),
          is_public = VALUES(is_public),
          featured = VALUES(featured),
          user_id = VALUES(user_id),
          user_name = VALUES(user_name),
          team_id = VALUES(team_id),
          video_file_path = VALUES(video_file_path),
          updated_at = VALUES(updated_at)
      `;

      await mysqlConnection.execute(insertVideoQuery, [
        video.id,
        video.title,
        video.instructor,
        video.description,
        video.category,
        video.thumbnail,
        video.video_url,
        video.duration,
        video.rating,
        video.views,
        video.is_public,
        video.featured,
        video.user_id,
        video.user_name,
        video.team_id,
        video.video_file_path,
        video.created_at,
        video.updated_at
      ]);
    }

    // Migrate categories
    console.log('Migrating categories...');
    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const category of categories) {
      const insertCategoryQuery = `
        INSERT INTO categories (id, name, description, created_at)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description)
      `;

      await mysqlConnection.execute(insertCategoryQuery, [
        category.id,
        category.name,
        category.description,
        category.created_at
      ]);
    }

    // Migrate orders
    console.log('Migrating orders...');
    const orders = sqliteDb.prepare('SELECT * FROM orders').all();
    for (const order of orders) {
      const insertOrderQuery = `
        INSERT INTO orders (id, user_id, total, status, address, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          user_id = VALUES(user_id),
          total = VALUES(total),
          status = VALUES(status),
          address = VALUES(address),
          updated_at = VALUES(updated_at)
      `;

      await mysqlConnection.execute(insertOrderQuery, [
        order.id,
        order.user_id,
        order.total,
        order.status,
        order.address,
        order.created_at,
        order.updated_at
      ]);
    }

    // Migrate order items
    console.log('Migrating order items...');
    const orderItems = sqliteDb.prepare('SELECT * FROM order_items').all();
    for (const item of orderItems) {
      const insertOrderItemQuery = `
        INSERT INTO order_items (id, order_id, item_id, item_type, title, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          order_id = VALUES(order_id),
          item_id = VALUES(item_id),
          item_type = VALUES(item_type),
          title = VALUES(title),
          price = VALUES(price),
          quantity = VALUES(quantity)
      `;

      await mysqlConnection.execute(insertOrderItemQuery, [
        item.id,
        item.order_id,
        item.item_id,
        item.item_type,
        item.title,
        item.price,
        item.quantity
      ]);
    }

    // Migrate user sessions
    console.log('Migrating user sessions...');
    const userSessions = sqliteDb.prepare('SELECT * FROM user_sessions').all();
    for (const session of userSessions) {
      const insertSessionQuery = `
        INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          user_id = VALUES(user_id),
          token = VALUES(token),
          expires_at = VALUES(expires_at)
      `;

      await mysqlConnection.execute(insertSessionQuery, [
        session.id,
        session.user_id,
        session.token,
        session.expires_at,
        session.created_at
      ]);
    }

    // Migrate password reset tokens
    console.log('Migrating password reset tokens...');
    const passwordResetTokens = sqliteDb.prepare('SELECT * FROM password_reset_tokens').all();
    for (const token of passwordResetTokens) {
      const insertTokenQuery = `
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          user_id = VALUES(user_id),
          token = VALUES(token),
          expires_at = VALUES(expires_at),
          used = VALUES(used)
      `;

      await mysqlConnection.execute(insertTokenQuery, [
        token.id,
        token.user_id,
        token.token,
        token.expires_at,
        token.used,
        token.created_at
      ]);
    }

    console.log('Migration completed successfully!');
    console.log(`Migrated ${users.length} users`);
    console.log(`Migrated ${books.length} books`);
    console.log(`Migrated ${videos.length} videos`);
    console.log(`Migrated ${categories.length} categories`);
    console.log(`Migrated ${orders.length} orders`);
    console.log(`Migrated ${orderItems.length} order items`);
    console.log(`Migrated ${userSessions.length} user sessions`);
    console.log(`Migrated ${passwordResetTokens.length} password reset tokens`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
    if (sqliteDb) {
      sqliteDb.close();
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToMySQL()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToMySQL };
