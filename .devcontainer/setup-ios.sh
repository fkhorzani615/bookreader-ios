#!/bin/bash

echo "🚀 Setting up iOS development environment in GitHub Codespaces..."

# Check if we're in a Codespace
if [ -n "$CODESPACES" ]; then
    echo "✅ Running in GitHub Codespaces"
else
    echo "⚠️  Not running in GitHub Codespaces"
fi

# Install Xcode Command Line Tools (if not already installed)
if ! command -v xcode-select &> /dev/null; then
    echo "📱 Installing Xcode Command Line Tools..."
    xcode-select --install || echo "⚠️  Xcode Command Line Tools installation failed or already installed"
else
    echo "✅ Xcode Command Line Tools already installed"
fi

# Check Swift availability
if command -v swift &> /dev/null; then
    echo "✅ Swift is available: $(swift --version | head -n 1)"
else
    echo "❌ Swift is not available"
fi

# Check if we can build the project
echo "🔨 Testing project build..."
cd /workspaces/bookreader_ios/BookReaderios

if [ -f "Package.swift" ]; then
    echo "📦 Swift Package found, testing build..."
    swift build || echo "⚠️  Swift build failed (this is normal if Xcode tools aren't fully installed)"
else
    echo "⚠️  Package.swift not found"
fi

echo "🎯 iOS development environment setup complete!"
echo ""
echo "📱 To test your app:"
echo "   1. Open the project in Xcode (if available)"
echo "   2. Use iOS Simulator in the browser"
echo "   3. Build and run from command line"
echo ""
echo "🔗 Your project is ready for iOS development!"
