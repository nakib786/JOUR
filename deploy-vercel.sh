#!/bin/bash

# Vercel Deployment Script
echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at the URL shown above"
echo "📊 Check your Vercel dashboard for analytics and logs" 