const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Nginx + Firebase deployment...');

// Step 1: Build the application
console.log('\n📦 Building the React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create deployment directory
const deployDir = path.join(__dirname, 'deploy-nginx');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Step 3: Copy build files to deployment directory
console.log('\n📁 Copying build files to deployment directory...');
try {
  execSync(`xcopy "build\\*" "${deployDir}\\public\\" /E /I /Y`, { stdio: 'inherit' });
  console.log('✅ Build files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy build files:', error.message);
  process.exit(1);
}

// Step 4: Create Nginx configuration
console.log('\n🌐 Creating Nginx configuration...');
const nginxConfig = `# Nginx configuration for BookReader with Firebase backend
# Generated on ${new Date().toISOString()}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (update with your certificate paths)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384";
    ssl_prefer_server_ciphers off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Document root
    root /var/www/bookreader/public;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Firebase API proxy (if using Firebase Functions)
    location /api/ {
        proxy_pass https://us-central1-bookreader-54669.cloudfunctions.net/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Logging
    access_log /var/log/nginx/bookreader_access.log;
    error_log /var/log/nginx/bookreader_error.log;
}`;

fs.writeFileSync(path.join(deployDir, 'nginx.conf'), nginxConfig);

// Step 5: Create deployment script
console.log('\n📋 Creating deployment scripts...');
const deployScript = `#!/bin/bash
# Nginx + Firebase deployment script

echo "🚀 Deploying BookReader with Nginx..."

# Update system packages
sudo apt update

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
fi

# Install Certbot for SSL certificates
if ! command -v certbot &> /dev/null; then
    echo "🔒 Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create web directory
sudo mkdir -p /var/www/bookreader

# Copy application files
echo "📁 Copying application files..."
sudo cp -r public/* /var/www/bookreader/public/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/bookreader
sudo chmod -R 755 /var/www/bookreader

# Copy Nginx configuration
echo "🌐 Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/bookreader

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bookreader /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    sudo systemctl reload nginx
    echo "🔄 Nginx reloaded successfully"
    
    # Setup SSL certificate (replace with your domain)
    echo "🔒 Setting up SSL certificate..."
    echo "Please run: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
    
    echo "🎉 Deployment completed!"
    echo "🌐 Your app should be available at: https://yourdomain.com"
    echo "📊 Check status with: sudo systemctl status nginx"
    
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi`;

fs.writeFileSync(path.join(deployDir, 'deploy.sh'), deployScript);

// Step 6: Create Windows deployment script
const windowsDeployScript = `@echo off
echo 🚀 Nginx + Firebase Deployment for Windows
echo.

echo 📋 This script prepares files for Nginx deployment
echo 📁 Files are ready in: deploy-nginx/
echo.
echo 📋 Next steps:
echo 1. Upload deploy-nginx/ to your Linux server
echo 2. SSH into your server
echo 3. Run: chmod +x deploy.sh
echo 4. Run: ./deploy.sh
echo 5. Follow SSL certificate setup instructions
echo.

pause`;

fs.writeFileSync(path.join(deployDir, 'deploy.bat'), windowsDeployScript);

// Step 7: Create README
console.log('\n📖 Creating deployment documentation...');
const readme = `# Nginx + Firebase Deployment

## Overview
This deployment package contains your React application configured to run with Nginx web server and Firebase backend services.

## Files Included
- \`public/\` - Your React build files
- \`nginx.conf\` - Nginx configuration with HTTPS support
- \`deploy.sh\` - Linux deployment script
- \`deploy.bat\` - Windows preparation script

## Deployment Steps

### 1. Upload to Server
Upload the entire \`deploy-nginx\` folder to your Linux server.

### 2. Run Deployment Script
\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 3. Setup SSL Certificate
\`\`\`bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

### 4. Update Domain
Edit \`nginx.conf\` and replace \`yourdomain.com\` with your actual domain.

## Firebase Integration

Your app uses Firebase for:
- Authentication
- Firestore Database
- Storage
- Hosting (optional)

## Benefits of This Setup

✅ **Full Control**: Complete control over server configuration
✅ **Custom Domain**: Use your own domain with SSL
✅ **Performance**: Nginx optimizations for React apps
✅ **Security**: HTTPS with modern SSL settings
✅ **Caching**: Optimized caching for static assets
✅ **Compression**: Gzip compression for faster loading

## Monitoring

- Check Nginx status: \`sudo systemctl status nginx\`
- View logs: \`sudo tail -f /var/log/nginx/bookreader_error.log\`
- Monitor access: \`sudo tail -f /var/log/nginx/bookreader_access.log\`

## Troubleshooting

### Common Issues
1. **Permission Denied**: Run \`sudo chown -R www-data:www-data /var/www/bookreader\`
2. **SSL Issues**: Check certificate paths in nginx.conf
3. **404 Errors**: Ensure React Router fallback is working

### SSL Certificate Renewal
\`\`\`bash
sudo certbot renew --dry-run
\`\`\`

## Firebase Backend Services

Your app connects to Firebase services:
- **Project ID**: bookreader-54669
- **Auth Domain**: bookreader-54669.firebaseapp.com
- **Storage**: bookreader-54669.firebasestorage.app

## Performance Tips

1. **Enable HTTP/2**: Already configured in nginx.conf
2. **Cache Static Assets**: Configured for 1-year caching
3. **Gzip Compression**: Enabled for text-based files
4. **Security Headers**: HSTS and other protections enabled

---

**Your React app is now ready for production with Nginx and Firebase!** 🚀`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readme);

// Step 8: Display summary
console.log('\n🎉 Nginx + Firebase deployment package created!');
console.log('=====================================');
console.log('📁 Deployment directory: deploy-nginx/');
console.log('🌐 Nginx configuration: nginx.conf');
console.log('📋 Linux script: deploy.sh');
console.log('📋 Windows script: deploy.bat');
console.log('📖 Documentation: README.md');
console.log('=====================================');

console.log('\n📋 Next Steps:');
console.log('1. Upload deploy-nginx/ to your Linux server');
console.log('2. Run: chmod +x deploy.sh && ./deploy.sh');
console.log('3. Setup SSL certificate with Certbot');
console.log('4. Update domain in nginx.conf');
console.log('5. Your app will be live with HTTPS!');

console.log('\n🔒 HTTPS Features:');
console.log('✅ Automatic HTTP to HTTPS redirects');
console.log('✅ Modern SSL/TLS configuration');
console.log('✅ Security headers (HSTS, XSS protection)');
console.log('✅ Gzip compression');
console.log('✅ Static asset caching');
console.log('✅ React Router support');
