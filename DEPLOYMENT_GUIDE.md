# BookReader Deployment Guide

This guide will help you deploy your React application with MySQL backend to your web server.

## Prerequisites

- Node.js 16+ installed on your web server
- FTP access to your web server
- MySQL database access

## Server Information

- **FTP Host**: win8126.site4now.net
- **FTP Username**: fkhorzani7312-001
- **FTP Password**: Sarah2012@
- **MySQL Host**: mysql5047.site4now.net
- **MySQL Database**: db_a93fb8_bookrea
- **MySQL Username**: a93fb8_bookrea
- **MySQL Password**: Sarah10072012@

## Step 1: Prepare Your Local Environment

1. **Build the React Application**
   ```bash
   npm run build
   ```

2. **Run the Deployment Script**
   ```bash
   deploy-to-server.bat
   ```
   This will create a `deploy` folder with all necessary files.

## Step 2: Upload to Web Server

1. **Connect via FTP**
   - Use any FTP client (FileZilla, WinSCP, etc.)
   - Host: win8126.site4now.net
   - Username: fkhorzani7312-001
   - Password: Sarah2012@

2. **Upload the Deployment Package**
   - Upload the entire `deploy` folder to your web server
   - Place it in the root directory or a subdirectory

## Step 3: Server Setup

1. **SSH into your server** (if available)
   ```bash
   ssh your-username@win8126.site4now.net
   ```

2. **Navigate to the deployment directory**
   ```bash
   cd deploy
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Environment Variables**
   ```bash
   # Copy the production config
   cp production-config.env .env
   ```

5. **Start the Server**
   ```bash
   npm start
   ```

## Step 4: Process Manager Setup (Recommended)

For production, use PM2 to keep your server running:

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**
   ```bash
   pm2 start server-production.js --name "bookreader"
   ```

3. **Save PM2 Configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

4. **Monitor the Application**
   ```bash
   pm2 status
   pm2 logs bookreader
   ```

## Step 5: Domain Configuration

1. **Update DNS Settings**
   - Point your domain to: 208.98.35.126
   - DNS Servers: NS1.SITE4NOW.NET, NS2.SITE4NOW.NET, NS3.SITE4NOW.NET

2. **Configure Web Server**
   - Ensure port 3001 is accessible
   - Set up reverse proxy if needed (Apache/Nginx)

## Step 6: SSL Certificate (Recommended)

For HTTPS, obtain an SSL certificate:

1. **Let's Encrypt** (Free)
   ```bash
   # Install certbot
   sudo apt-get install certbot
   
   # Obtain certificate
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Configure HTTPS in your server**
   - Update the server to use HTTPS
   - Redirect HTTP to HTTPS

## Step 7: Testing

1. **Health Check**
   ```
   http://yourdomain.com/api/health
   ```

2. **Test API Endpoints**
   ```
   http://yourdomain.com/api/books
   http://yourdomain.com/api/videos
   ```

3. **Test Frontend**
   ```
   http://yourdomain.com
   ```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **MySQL Connection Failed**
   - Verify database credentials
   - Check if MySQL server is running
   - Ensure firewall allows connections

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check disk space

4. **CORS Issues**
   - Update CORS configuration in server-production.js
   - Ensure frontend URL is correct

### Logs and Monitoring

1. **View Application Logs**
   ```bash
   pm2 logs bookreader
   ```

2. **Monitor System Resources**
   ```bash
   pm2 monit
   ```

3. **Restart Application**
   ```bash
   pm2 restart bookreader
   ```

## Security Considerations

1. **Change Default Passwords**
   - Update JWT_SECRET in production
   - Use strong database passwords

2. **Firewall Configuration**
   - Only open necessary ports
   - Restrict access to admin interfaces

3. **Regular Updates**
   - Keep Node.js updated
   - Update dependencies regularly
   - Monitor security advisories

## Backup Strategy

1. **Database Backups**
   ```bash
   # Create backup script
   mysqldump -h mysql5047.site4now.net -u a93fb8_bookrea -p db_a93fb8_bookrea > backup.sql
   ```

2. **File Backups**
   - Backup uploads directory
   - Backup configuration files

3. **Automated Backups**
   - Set up cron jobs for regular backups
   - Store backups in secure location

## Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Caching Headers**
   ```javascript
   app.use(express.static('build', {
     maxAge: '1y',
     etag: true
   }));
   ```

3. **Database Optimization**
   - Add indexes to frequently queried columns
   - Optimize queries
   - Monitor slow queries

## Support

If you encounter issues:

1. Check the logs: `pm2 logs bookreader`
2. Verify database connectivity
3. Test API endpoints individually
4. Check server resources (CPU, memory, disk)

## Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Monitor for security patches
   - Backup before major updates

2. **Monitoring**
   - Set up uptime monitoring
   - Monitor error rates
   - Track performance metrics

3. **Scaling**
   - Monitor resource usage
   - Plan for increased traffic
   - Consider load balancing if needed
