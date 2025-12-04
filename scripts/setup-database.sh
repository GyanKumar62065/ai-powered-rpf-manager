#!/bin/bash

# RFP Management System - Database Setup Script
# This script sets up the MySQL database for the application

set -e

echo "==================================="
echo "RFP Management System - Database Setup"
echo "==================================="
echo ""

# Configuration
DB_NAME="rfp_management"
DB_USER="rfp_user"
DB_PASSWORD="rfp_password"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: MySQL is not installed or not in PATH"
    echo "Please install MySQL 5.7+ or 8.0"
    exit 1
fi

echo "✓ MySQL found"
echo ""

# Prompt for MySQL root password
echo "Please enter MySQL root password:"
read -s MYSQL_ROOT_PASSWORD
echo ""

# Create database and user
echo "Creating database and user..."

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<MYSQL_SCRIPT
-- Drop database if exists (for fresh setup)
DROP DATABASE IF EXISTS ${DB_NAME};

-- Create database
CREATE DATABASE ${DB_NAME};

-- Create user (or update if exists)
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;

-- Verify
USE ${DB_NAME};
SELECT 'Database created successfully!' AS Status;
MYSQL_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database setup completed successfully!"
    echo ""
    echo "Database Details:"
    echo "  Name: ${DB_NAME}"
    echo "  User: ${DB_USER}"
    echo "  Password: ${DB_PASSWORD}"
    echo ""
    echo "Connection String:"
    echo "  mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"
    echo ""
    echo "Next steps:"
    echo "  1. Create server/.env file with the connection string"
    echo "  2. Run: cd server && npm run prisma:push"
else
    echo ""
    echo "❌ Database setup failed"
    exit 1
fi
