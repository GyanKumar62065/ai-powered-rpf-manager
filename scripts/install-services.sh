#!/bin/bash

# Install required services for RFP Management System

set -e

MODEL_NAME="llama3.2:1b"

echo "==================================="
echo "Installing Required Services"
echo "==================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "✓ Homebrew found"
echo ""

# Install Ollama
echo "Installing Ollama..."
if command -v ollama &> /dev/null; then
    echo "✓ Ollama already installed"
else
    brew install ollama
    echo "✓ Ollama installed"
fi
echo ""

# Start Ollama service if not already running (Mac)
if ! pgrep -x "ollama" >/dev/null; then
    echo "Starting Ollama service..."
    ollama serve &
    sleep 3
fi

# Pull AI Model Automatically
echo "Checking if model '$MODEL_NAME' is installed..."
if ollama list | grep -q "$MODEL_NAME"; then
    echo "✓ Model '$MODEL_NAME' already installed"
else
    echo "📥 Pulling model '$MODEL_NAME'..."
    ollama pull "$MODEL_NAME"
    echo "✓ Model '$MODEL_NAME' installed successfully"
fi
echo ""

# Install Mailpit
echo "Installing Mailpit..."
if command -v mailpit &> /dev/null; then
    echo "✓ Mailpit already installed"
else
    brew install mailpit
    echo "✓ Mailpit installed"
fi
echo ""

echo "==================================="
echo "Installation Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Start services: ./scripts/start-services.sh"
echo "2. Run app: npm run dev"
echo ""
