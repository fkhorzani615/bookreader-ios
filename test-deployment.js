const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if deployment files exist
const deployDir = path.join(__dirname, 'deploy-firebase');
if (!fs.existsSync(deployDir)) {
  console.error('❌ Deployment directory not found. Please run: node deploy-firebase.js');
  process.exit(1);
}

// Serve static files from deployment directory
app.use(express.static(deployDir));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(deployDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log('🚀 Firebase BookReader Test Server');
  console.log('=====================================');
  console.log(`📱 Server running on: http://localhost:${PORT}`);
  console.log('🔥 Firebase data will be loaded automatically');
  console.log('');
  console.log('📋 What you should see:');
  console.log('✅ Home page with categories, videos, and books');
  console.log('✅ Firebase data loaded from your Firebase project');
  console.log('✅ Search and filtering functionality');
  console.log('✅ Navigation between pages');
  console.log('');
  console.log('🔧 Firebase Configuration:');
  console.log('   Project ID: bookreader-54669');
  console.log('   API Key: AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ');
  console.log('');
  console.log('📁 Deployment files ready in: deploy-firebase/');
  console.log('📋 Instructions: deploy-firebase/DEPLOYMENT_README.md');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});
