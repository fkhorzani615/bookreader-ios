-- SQLite Database Schema for BookReader App
-- This replaces Firebase Firestore collections

-- Users table (replaces Firebase Auth + user profiles)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_expires_at DATETIME,
    watch_history TEXT, -- JSON array of video IDs
    favorites TEXT, -- JSON array of book/video IDs
    preferences TEXT, -- JSON object for user preferences
    is_admin BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- Books table (replaces Firestore books collection)
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    category TEXT,
    cover TEXT, -- URL to cover image
    pages INTEGER,
    rating REAL DEFAULT 0,
    price REAL DEFAULT 0,
    is_public BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    user_id TEXT,
    user_name TEXT,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Videos table (replaces Firestore videos collection)
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instructor TEXT,
    description TEXT,
    category TEXT,
    thumbnail TEXT, -- URL to thumbnail image
    video_url TEXT,
    duration TEXT, -- Format: "HH:MM:SS"
    rating REAL DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    user_id TEXT,
    user_name TEXT,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Categories table (for organizing books and videos)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (replaces Firestore orders collection)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table (for order details)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'book' or 'video'
    title TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- User sessions table (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(featured);
CREATE INDEX IF NOT EXISTS idx_books_public ON books(is_public);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_public ON videos(is_public);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description) VALUES
('Programming', 'Computer programming and software development'),
('Business', 'Business and entrepreneurship'),
('Self-Help', 'Personal development and self-improvement'),
('Technology', 'Technology and innovation'),
('Science', 'Scientific research and discoveries'),
('History', 'Historical events and analysis'),
('Fiction', 'Fictional literature and stories'),
('Non-Fiction', 'Non-fictional content and educational material'),
('Cooking', 'Culinary arts and recipes'),
('Travel', 'Travel guides and experiences');
