#!/bin/bash

# BioAiSaaS Full Stack Development Server Startup Script
# Runs both frontend and backend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}BioAiSaaS Full Stack Dev Server${NC}"
echo -e "${GREEN}================================${NC}"

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the BioAiSaaS root directory${NC}"
    exit 1
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
pip install -q fastapi uvicorn[standard] pydantic python-dotenv langchain 2>/dev/null || true

# Start backend server
echo -e "${BLUE}Starting backend server (port 8000)...${NC}"
python3 -m biomni.server &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 2

# Start frontend server
echo -e "${BLUE}Starting frontend server (port 8081)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started (PID: $FRONTEND_PID)${NC}"

# Print information
echo -e "${GREEN}================================${NC}"
echo -e "${YELLOW}Servers are running:${NC}"
echo -e "${BLUE}Frontend:  http://localhost:8081${NC}"
echo -e "${BLUE}Backend:   http://localhost:8000${NC}"
echo -e "${BLUE}API Docs:  http://localhost:8000/docs${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
