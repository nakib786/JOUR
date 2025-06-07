#!/bin/bash

# Netlify Deployment Script
echo "🚀 Deploying to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=.next

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at the URL shown above"
echo "📊 Check your Netlify dashboard for analytics and logs" 