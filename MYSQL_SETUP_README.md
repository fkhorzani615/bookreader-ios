# BookReader MySQL Setup Guide

This guide explains how to set up your React application with a MySQL backend for production deployment.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    MySQL    ┌─────────────────┐
│   React App     │ ◄──────────────► │  Node.js Server │ ◄─────────► │  MySQL Database │
│   (Frontend)    │                  │   (Backend)     │             │   (Remote)      │
└─────────────────┘                  └─────────────────┘             └─────────────────┘
```

## 📋 Prerequisites

- Node.js 16+ installed
- MySQL database access
- Web server with Node.js support
- FTP access to web server

## 🗄️ Database Configuration

Your MySQL database is already configured with the following details:

- **Host**: mysql5047.site4now.net
- **Database**: db_a93fb8_bookrea
- **Username**: a93fb8_bookrea
- **Password**: Sarah10072012@
- **Port**: 3306

## 🚀 Quick Start

### 1. Test Database Connection

First, verify your MySQL connection:

```bash
node test-production-connection.js
```

You should see:
```
✅ MySQL connection successful!
📚 Books count: 16
🎥 Videos count: 22
👥 Users count: 5
```

### 2. Switch to MySQL Backend

```bash
npm run switch-to-mysql
```

This will:
- Backup your current SQLite App.js
- Switch to MySQL authentication and data contexts
- Update package.json with MySQL scripts

### 3. Start the MySQL Server

```bash
npm run start-mysql
```

### 4. Start the React App

```bash
npm start
```

## 🔧 Development vs Production

### Development Mode
- Backend runs on `http://localhost:3001`
- React app runs on `http://localhost:3000`
- Uses local MySQL connection

### Production Mode
- Backend runs on your web server
- React app connects to `http://win8126.site4now.net:3001`
- Uses remote MySQL database

## 📁 File Structure

```
src/
├── context/
│   ├── MySQLAuthContext.js      # MySQL authentication
│   ├── MySQLBooksContext.js     # MySQL books operations
│   └── MySQLVideosContext.js    # MySQL videos operations
├── pages/
│   ├── Login-MySQL.js           # MySQL login page
│   └── Register-MySQL.js        # MySQL register page
├── App-MySQL.js                 # MySQL version of App
└── App.js                       # Current active App

server-production.js             # Production server
package-production.json          # Production dependencies
production-config.env           # Production environment
```

## 🔄 Switching Between Backends

### Switch to MySQL
```bash
npm run switch-to-mysql
```

### Switch back to SQLite
```bash
npm run switch-to-sqlite
```

## 🌐 API Endpoints

The MySQL backend provides these endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get specific video
- `POST /api/videos` - Create new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Categories
- `GET /api/categories` - Get all categories

### Health Check
- `GET /api/health` - Server health status

## 🔐 Security Features

The production server includes:

- **Helmet.js** - Security headers
- **Rate limiting** - 100 requests per 15 minutes
- **CORS protection** - Configured for production
- **JWT authentication** - Secure token-based auth
- **Input validation** - File upload and data validation
- **SQL injection protection** - Parameterized queries

## 📤 File Uploads

The server handles file uploads for:

- **Book covers** - Images (JPG, PNG, etc.)
- **Book audio** - Audio files (MP3, WAV, etc.)
- **Videos** - Video files (MP4, AVI, etc.)

Files are stored in the `uploads/` directory and served statically.

## 🚀 Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Create Deployment Package

```bash
deploy-to-server.bat
```

This creates a `deploy/` folder with all necessary files.

### 3. Upload to Web Server

Use FTP to upload the `deploy/` folder to your web server:
- **Host**: win8126.site4now.net
- **Username**: fkhorzani7312-001
- **Password**: Sarah2012@

### 4. Server Setup

SSH into your server and run:

```bash
cd deploy
npm install
npm start
```

### 5. Process Management (Recommended)

Install PM2 for production:

```bash
npm install -g pm2
pm2 start server-production.js --name "bookreader"
pm2 save
pm2 startup
```

## 🔍 Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   ```bash
   node test-production-connection.js
   ```
   Check your database credentials and network connectivity.

2. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

3. **CORS Errors**
   - Check CORS configuration in server-production.js
   - Verify frontend URL is correct

4. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check disk space

### Logs and Monitoring

```bash
# View application logs
pm2 logs bookreader

# Monitor system resources
pm2 monit

# Restart application
pm2 restart bookreader
```

## 📊 Database Schema

The MySQL database includes these tables:

- **users** - User accounts and profiles
- **books** - Book information and metadata
- **videos** - Video information and metadata
- **categories** - Content categories
- **orders** - Purchase orders (if applicable)

## 🔄 Data Migration

If you have existing SQLite data, you can migrate it to MySQL:

```bash
npm run migrate-to-mysql
```

This will transfer all your local data to the remote MySQL database.

## 🛡️ Security Best Practices

1. **Change Default Passwords**
   - Update JWT_SECRET in production
   - Use strong database passwords

2. **Regular Updates**
   - Keep Node.js updated
   - Update dependencies regularly
   - Monitor security advisories

3. **Backup Strategy**
   ```bash
   # Database backup
   mysqldump -h mysql5047.site4now.net -u a93fb8_bookrea -p db_a93fb8_bookrea > backup.sql
   ```

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs bookreader`
2. Verify database connectivity
3. Test API endpoints individually
4. Check server resources (CPU, memory, disk)

## 🎯 Next Steps

1. **SSL Certificate** - Set up HTTPS for production
2. **Domain Configuration** - Point your domain to the server
3. **Monitoring** - Set up uptime monitoring
4. **Backup Automation** - Schedule regular backups
5. **Performance Optimization** - Add caching and compression

---

**Note**: This setup provides a production-ready MySQL backend for your React application. The server is configured with security best practices and can handle real-world traffic.
