#!/bin/bash

echo "Starting Oil Pipeline Anomaly Detection System"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed"
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Start the Flask API server
echo "Starting API server..."
cd scripts
python3 api_server.py &
API_PID=$!

echo "API Server started with PID: $API_PID"
echo "API available at: http://localhost:5000"
echo ""
echo "Now start the Next.js frontend with: npm run dev"
echo ""
echo "To stop the API server, run: kill $API_PID"

# Keep the script running
wait $API_PID
