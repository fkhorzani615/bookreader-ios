# MySQL Migration Guide for BookReader

This guide will help you migrate your BookReader application from SQLite and Firebase to MySQL while maintaining the same webpage format and functionality.

## Prerequisites

1. **MySQL Server**: Make sure you have MySQL installed and running on your system
2. **Node.js**: Ensure you have Node.js installed (version 14 or higher)
3. **Existing Data**: Your current SQLite database (`bookreader.db`) should be present

## Installation Steps

### 1. Install MySQL Dependencies

```bash
npm install mysql2
```

### 2. Configure MySQL Connection

1. Create a MySQL database:
```sql
CREATE DATABASE bookreader CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update the MySQL configuration in `mysql-config.env`:
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=bookreader
MYSQL_PORT=3306
```

### 3. Run the Migration

```bash
# Run the migration script
npm run migrate-to-mysql
```

This will:
- Create the MySQL schema with all necessary tables
- Migrate all data from SQLite to MySQL
- Preserve all relationships and data integrity

### 4. Start the MySQL Server

```bash
# Start the server with MySQL backend
npm run server-mysql
```

Or use the combined setup command:
```bash
npm run setup-mysql
```

## Migration Details

### What Gets Migrated

- **Users**: All user accounts, profiles, and authentication data
- **Books**: All book records with metadata, file paths, and relationships
- **Videos**: All video records with metadata, file paths, and relationships
- **Categories**: All category definitions
- **Orders**: All order records and order items
- **Sessions**: User session data
- **Password Reset Tokens**: Password reset functionality data

### Database Schema Changes

The MySQL schema includes several improvements over SQLite:

- **Better Data Types**: Proper VARCHAR, TEXT, DECIMAL types
- **JSON Support**: Native JSON columns for complex data
- **Foreign Key Constraints**: Proper referential integrity
- **Indexes**: Optimized indexes for better performance
- **Character Set**: UTF8MB4 support for full Unicode

### API Compatibility

The MySQL server (`server-mysql.js`) maintains 100% API compatibility with the original SQLite server:

- Same endpoint structure
- Same request/response formats
- Same authentication flow
- Same file upload functionality
- Same error handling

## File Structure

```
bookreader/
├── mysql-schema.sql          # MySQL database schema
├── mysql-migration.js        # Migration script
├── server-mysql.js          # MySQL-based server
├── mysql-config.env         # MySQL configuration
├── bookreader.db            # Original SQLite database
└── server.js               # Original SQLite server
```

## Environment Variables

The application uses these environment variables for MySQL configuration:

- `MYSQL_HOST`: MySQL server host (default: localhost)
- `MYSQL_USER`: MySQL username (default: root)
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: Database name (default: bookreader)
- `MYSQL_PORT`: MySQL port (default: 3306)
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 3001)

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure MySQL server is running
   - Check host and port configuration
   - Verify firewall settings

2. **Authentication Failed**:
   - Verify username and password
   - Check MySQL user permissions
   - Ensure user has access to the database

3. **Migration Errors**:
   - Check MySQL server logs
   - Verify database exists
   - Ensure sufficient disk space

### Rollback Plan

If you need to rollback to SQLite:

1. Stop the MySQL server
2. Run the original server: `npm run server`
3. The original SQLite database remains unchanged

## Performance Considerations

### MySQL Advantages

- **Better Concurrency**: Handles multiple simultaneous connections
- **Scalability**: Better for production environments
- **Advanced Queries**: Support for complex SQL operations
- **Backup & Recovery**: Robust backup and recovery options

### Optimization Tips

1. **Connection Pooling**: The server uses connection pooling for better performance
2. **Indexes**: Proper indexes are created for common query patterns
3. **Query Optimization**: Prepared statements prevent SQL injection and improve performance

## Production Deployment

For production deployment:

1. **Security**:
   - Change default MySQL password
   - Use strong JWT secret
   - Configure proper firewall rules
   - Enable SSL connections

2. **Performance**:
   - Configure MySQL for your server specifications
   - Set appropriate connection pool limits
   - Monitor query performance

3. **Backup**:
   - Set up regular MySQL backups
   - Test backup and recovery procedures

## Support

If you encounter any issues during migration:

1. Check the console output for error messages
2. Verify MySQL server status
3. Review the migration logs
4. Ensure all prerequisites are met

The migration maintains full compatibility with your existing frontend code, so no changes are needed to your React application.
