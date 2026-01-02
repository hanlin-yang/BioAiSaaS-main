#!/bin/bash

# BioAiSaaS Backend Server Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}BioAiSaaS Backend Server${NC}"
echo -e "${GREEN}================================${NC}"

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Python version:${NC}"
python3 --version

# Install required dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -q fastapi uvicorn[standard] pydantic python-dotenv langchain

# Start backend server
echo -e "${GREEN}Starting backend server on http://0.0.0.0:8000${NC}"
echo -e "${YELLOW}API Documentation: http://localhost:8000/docs${NC}"
echo -e "${YELLOW}API OpenAPI Schema: http://localhost:8000/openapi.json${NC}"

# Run the server
python3 -m biomni.server
