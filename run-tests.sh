#!/bin/bash

# Test Runner Script
# Comprehensive testing with environment setup and reporting

set -e

echo "🧪 Starting Prompt Core Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}🐍 Setting up Python virtual environment...${NC}"
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r script/requirements.txt
else
    echo -e "${BLUE}🐍 Activating Python virtual environment...${NC}"
    source .venv/bin/activate
fi

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${YELLOW}⚙️  Creating test environment file...${NC}"
    cp .env.example .env.test
    echo "OPENAI_API_KEY=test-key" >> .env.test
fi

# Run different test suites based on argument
case "${1:-all}" in
    "unit")
        echo -e "${BLUE}🔧 Running Unit Tests...${NC}"
        npm run test:unit
        ;;
    "integration")
        echo -e "${BLUE}🔗 Running Integration Tests...${NC}"
        npm run test:integration
        ;;
    "api")
        echo -e "${BLUE}🌐 Running API Tests...${NC}"
        npm run test:api
        ;;
    "coverage")
        echo -e "${BLUE}📊 Running Tests with Coverage...${NC}"
        npm run test:coverage
        ;;
    "watch")
        echo -e "${BLUE}👀 Running Tests in Watch Mode...${NC}"
        npm run test:watch
        ;;
    "all"|*)
        echo -e "${BLUE}🚀 Running All Tests...${NC}"
        
        echo -e "${YELLOW}Step 1: Unit Tests${NC}"
        npm run test:unit
        
        echo -e "${YELLOW}Step 2: Integration Tests${NC}"
        npm run test:integration
        
        echo -e "${YELLOW}Step 3: API Tests${NC}"
        npm run test:api
        
        echo -e "${GREEN}✅ All tests completed!${NC}"
        ;;
esac

echo -e "${GREEN}🎉 Test execution finished!${NC}"

if [[ "${1}" == "coverage" || "${2}" == "--coverage" ]]; then
    echo -e "${BLUE}📈 Coverage report generated in coverage/ directory${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open coverage/lcov-report/index.html
    fi
fi
