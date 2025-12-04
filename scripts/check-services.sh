#!/bin/bash

# RFP Management System - Service Health Check
# Checks if all required services are running

set -e

echo "==================================="
echo "RFP Management System - Service Check"
echo "==================================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION"
else
    echo "❌ Node.js not found"
    echo "   Install from: https://nodejs.org/"
fi
echo ""

# Check MySQL
echo "Checking MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | awk '{print $5}' | sed 's/,//')
    echo "✓ MySQL $MYSQL_VERSION"
    
    # Try to connect
    if mysql -u rfp_user -prfp_password -e "USE rfp_management;" 2>/dev/null; then
        echo "✓ Database connection successful"
    else
        echo "⚠ Database not configured. Run: ./scripts/setup-database.sh"
    fi
else
    echo "❌ MySQL not found"
    echo "   Install from: https://dev.mysql.com/downloads/mysql/"
fi
echo ""

# Check Ollama
echo "Checking Ollama..."
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version | head -n 1)
    echo "✓ Ollama installed: $OLLAMA_VERSION"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✓ Ollama service is running on port 11434"
        
        # Check for llama3.2 model
        if curl -s http://localhost:11434/api/tags | grep -q "llama3.2"; then
            echo "✓ Model llama3.2 is available"
        else
            echo "⚠ Model llama3.2 not found. Run: ollama pull llama3.2"
        fi
    else
        echo "⚠ Ollama service not running. Run: ollama serve"
    fi
else
    echo "❌ Ollama not found"
    echo "   Install from: https://ollama.com/"
fi
echo ""

# Check Mailpit
echo "Checking Mailpit..."
if command -v mailpit &> /dev/null; then
    echo "✓ Mailpit installed"
    
    # Check if Mailpit is running
    if curl -s http://localhost:8025 > /dev/null 2>&1; then
        echo "✓ Mailpit UI is running on port 8025"
        echo "✓ SMTP server on port 1025"
    else
        echo "⚠ Mailpit not running. Run: mailpit"
    fi
else
    echo "⚠ Mailpit not found"
    echo "   Install: brew install mailpit (macOS)"
    echo "   Or from: https://github.com/axllent/mailpit/releases"
fi
echo ""

# Summary
echo "==================================="
echo "Summary"
echo "==================================="
echo ""
echo "Service Status:"
echo "  • Node.js: $(command -v node &> /dev/null && echo '✓' || echo '❌')"
echo "  • MySQL: $(command -v mysql &> /dev/null && echo '✓' || echo '❌')"
echo "  • Ollama: $(curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo '✓ Running' || echo '❌ Not running')"
echo "  • Mailpit: $(curl -s http://localhost:8025 > /dev/null 2>&1 && echo '✓ Running' || echo '❌ Not running')"
echo ""
