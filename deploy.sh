#!/bin/bash

# Deployment script for Employee Management System
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MySQL (if not installed)
if ! command -v mysql &> /dev/null; then
    echo "🗄️ Installing MySQL..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# Install Redis (if not installed)
if ! command -v redis-server &> /dev/null; then
    echo "🔴 Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
fi

# Install PM2 globally
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Install project dependencies
echo "📚 Installing project dependencies..."
npm install

# Set up database
echo "🗃️ Setting up database..."
mysql -u root -p < database.sql

# Copy environment file
if [ ! -f .env ]; then
    echo "⚠️ Please create .env file with your database credentials"
    cp .env.example .env 2>/dev/null || echo "Please manually create .env file"
fi

# Start application with PM2
echo "🔄 Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup firewall (optional)
echo "🔒 Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw allow ssh
sudo ufw --force enable

echo "✅ Deployment completed!"
echo "🌐 Application should be running on http://your-server-ip:3000"
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs with: pm2 logs employee-management"