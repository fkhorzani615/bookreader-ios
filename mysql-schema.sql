-- MySQL Database Schema for BookReader App
-- This replaces SQLite and Firebase with MySQL

-- Users table (replaces Firebase Auth + user profiles)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires_at TIMESTAMP NULL,
    watch_history JSON, -- JSON array of video IDs
    favorites JSON, -- JSON array of book/video IDs
    preferences JSON, -- JSON object for user preferences
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Books table (replaces Firestore books collection)
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    cover VARCHAR(500), -- URL to cover image
    pages INT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(36),
    user_name VARCHAR(255),
    team_id VARCHAR(36),
    image_file_path VARCHAR(500),
    audio_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Videos table (replaces Firestore videos collection)
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    thumbnail VARCHAR(500), -- URL to thumbnail image
    video_url VARCHAR(500),
    duration VARCHAR(10), -- Format: "HH:MM:SS"
    rating DECIMAL(3,2) DEFAULT 0.00,
    views INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(36),
    user_name VARCHAR(255),
    team_id VARCHAR(36),
    video_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Categories table (for organizing books and videos)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (replaces Firestore orders collection)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table (for order details)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'book' or 'video'
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- User sessions table (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_featured ON books(featured);
CREATE INDEX idx_books_public ON books(is_public);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_featured ON videos(featured);
CREATE INDEX idx_videos_public ON videos(is_public);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Insert default categories
INSERT IGNORE INTO categories (name, description) VALUES
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
