#!/bin/bash

# RFP Management System - Start All Services
# Starts Ollama, Mailpit, and the application

set -e

echo "==================================="
echo "Starting RFP Management System"
echo "==================================="
echo ""

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Start Ollama
echo "Starting Ollama..."
if port_in_use 11434; then
    echo "✓ Ollama already running on port 11434"
else
    echo "Starting Ollama in background..."
    ollama serve > /dev/null 2>&1 &
    OLLAMA_PID=$!
    echo "✓ Ollama started (PID: $OLLAMA_PID)"
    sleep 2
fi
echo ""

# Start Mailpit
echo "Starting Mailpit..."
if port_in_use 8025; then
    echo "✓ Mailpit already running on port 8025"
else
    echo "Starting Mailpit in background..."
    mailpit > /dev/null 2>&1 &
    MAILPIT_PID=$!
    echo "✓ Mailpit started (PID: $MAILPIT_PID)"
    sleep 2
fi
echo ""

echo "==================================="
echo "Services Started!"
echo "==================================="
echo ""
echo "Access Points:"
echo "  • Ollama API: http://localhost:11434"
echo "  • Mailpit UI: http://localhost:8025"
echo "  • SMTP Server: localhost:1025"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "To stop services:"
echo "  killall ollama mailpit"
echo ""
