#!/bin/bash
set -e

echo "Starting Stock Analyzer..."

# Kill any existing processes
pkill -f "python3 app.py" 2>/dev/null || true
pkill -f "vite.*stock-analyzer" 2>/dev/null || true

# Start Flask backend
cd "$(dirname "$0")/backend"
python3 app.py > /tmp/stock-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID (port 5001)"

# Wait for backend
sleep 2
curl -sf http://localhost:5001/api/health > /dev/null && echo "Backend: OK" || echo "Backend: FAILED"

# Start frontend
cd "$(dirname "$0")/frontend"
npm run dev > /tmp/stock-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID (port 5173)"

echo ""
echo "Stock Analyzer running at http://localhost:5173"
echo "Backend API at          http://localhost:5001/api/analyze?company=RELIANCE"
echo ""
echo "Press Ctrl+C to stop"
wait
