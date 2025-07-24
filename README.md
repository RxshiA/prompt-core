# 🚀 Prompt Core - AI-Powered Text Processing Backend

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange.svg)](https://openai.com/)

A powerful, production-ready backend service that provides AI-powered text processing capabilities including summarization, key point extraction, and content classification using OpenAI's GPT-4 model.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Security](#-security)

## ✨ Features

### 🤖 AI Text Processing
- **Text Summarization**: Condense long content into concise summaries
- **Key Point Extraction**: Identify and extract critical information
- **Content Classification**: Categorize text as News, Fact, or Opinion

### 🏗️ Production Ready
- **Security First**: CORS, Helmet.js, rate limiting, input validation
- **Error Handling**: Comprehensive error handling with detailed logging
- **Health Monitoring**: Built-in health checks and performance monitoring
- **Scalable**: Docker containerization with Railway deployment support

### 🔧 Developer Experience
- **External Configuration**: Prompts stored in external JSON files
- **Environment-based**: Different configs for development/production
- **Type Safety**: TypeScript-ready with comprehensive validation
- **Logging**: Detailed request/response logging

## 🏛️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │───▶│   Node.js       │───▶│   Python        │
│   (React/Vue)   │    │   Express API   │    │   OpenAI Script │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   OpenAI API    │
                       │   (GPT-4)       │
                       │                 │
                       └─────────────────┘
```

**Technology Stack:**
- **Backend**: Node.js + Express.js
- **AI Processing**: Python + OpenAI API
- **Security**: Helmet.js, CORS, Rate Limiting
- **Deployment**: Docker + Railway
- **Configuration**: Environment variables + JSON files

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- OpenAI API Key

## 📦 Installation

### Local Development Setup

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/RxshiA/prompt-core.git
   cd prompt-core
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Python Virtual Environment**
   ```bash
   # Create virtual environment
   python3 -m venv .venv
   
   # Activate virtual environment
   # On macOS/Linux:
   source .venv/bin/activate
   
   # On Windows:
   .venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r script/requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your settings
   nano .env  # or use your preferred editor
   ```

### Docker Setup

```bash
# Build the Docker image
docker build -t prompt-core .

# Run the container
docker run -p 5000:5000 --env-file .env prompt-core
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Python Configuration
PYTHON_PATH=./.venv/bin/python

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security (Optional)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Prompt Configuration

Prompts are stored in `script/prompts.json` and can be modified:

```json
{
  "system": {
    "prompt": "You are an expert AI assistant..."
  },
  "summarize": {
    "prompt": "# TASK: TEXT SUMMARIZATION..."
  },
  "extract_key_points": {
    "prompt": "# TASK: KEY POINT EXTRACTION..."
  },
  "classify": {
    "prompt": "# TASK: TEXT CLASSIFICATION..."
  }
}
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: Your deployed URL

### Authentication
Currently uses OpenAI API key server-side. No client authentication required.

### Endpoints

#### `POST /api/process`
Process text using AI capabilities.

**Request Body:**
```json
{
  "text": "Your text content here...",
  "task": "summarize"  // "summarize" | "extract_key_points" | "classify"
}
```

**Response:**
```json
{
  "success": true,
  "output": "AI-generated result based on the task"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

**Task Types:**
- `summarize`: Create concise summaries (50-100 words)
- `extract_key_points`: Extract 3-8 key bullet points
- `classify`: Categorize as NEWS, FACT, or OPINION

#### `GET /api/health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "uptime": 3600.123
}
```

#### `GET /`
Server information and available endpoints.

### Request Limits
- **Text Length**: Maximum 10,000 characters
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Timeout**: 30 seconds per request

### Error Codes
- `INVALID_TEXT`: Text is required or invalid format
- `INVALID_TASK`: Task parameter missing or invalid
- `INVALID_TASK_TYPE`: Task must be summarize/extract_key_points/classify
- `TEXT_TOO_LONG`: Text exceeds 10,000 character limit
- `EMPTY_TEXT`: Text cannot be empty
- `PROCESSING_ERROR`: Internal processing error
- `INTERNAL_ERROR`: Server error

## 💻 Development

### Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Testing
npm test                    # Run all tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
npm run test:api          # Run API tests only
npm run test:coverage     # Run tests with coverage report
npm run test:watch        # Run tests in watch mode

# Test runner script (recommended)
./run-tests.sh            # Run all tests with setup
./run-tests.sh unit       # Run specific test suite
./run-tests.sh coverage   # Generate coverage report
```

## 🧪 Testing

### Test Structure

```
tests/
├── 📁 unit/              # Unit tests for individual functions
├── 📁 integration/       # Integration tests for components
├── 📁 api/              # API endpoint tests
├── 📁 fixtures/         # Test data and mock responses
├── 🔧 setup.js          # Test environment configuration
└── 📊 coverage/         # Generated coverage reports
```

### Test Categories

#### 🔧 **Unit Tests**
- Server function validation
- Input/output validation
- Error handling logic
- Configuration management
- Path construction

#### 🔗 **Integration Tests**
- Python script execution
- End-to-end text processing
- External service integration
- Performance and load testing
- Timeout and resource management

#### 🌐 **API Tests**
- Endpoint functionality
- Request/response validation
- Error response formats
- Security headers and CORS
- Rate limiting behavior

### Running Tests

#### Quick Test Run
```bash
# Install dependencies and run all tests
npm install
npm test
```

#### Comprehensive Testing
```bash
# Use the test runner for full setup
chmod +x run-tests.sh
./run-tests.sh all
```

#### Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests (requires Python setup)
npm run test:integration

# API tests
npm run test:api

# Watch mode for development
npm run test:watch
```

#### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Test Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r script/requirements.txt
   ```

2. **Configure Test Environment**
   ```bash
   cp .env.example .env.test
   # Edit .env.test with test-specific values
   ```

3. **Set OpenAI API Key** (for integration tests)
   ```bash
   echo "OPENAI_API_KEY=your_api_key" >> .env.test
   ```

### Test Data and Fixtures

Tests include comprehensive fixtures for:
- ✅ Various text types (news, facts, opinions, technical)
- ✅ Edge cases (unicode, special characters, large texts)
- ✅ Error scenarios (invalid inputs, API failures)
- ✅ Mock responses and expected outputs
- ✅ Performance benchmarks

### Continuous Integration

Tests are designed to work in CI/CD environments:
- Environment variable configuration
- Timeout handling for slow tests
- Proper cleanup and resource management
- Detailed error reporting

### Testing Best Practices

- **Isolation**: Each test is independent
- **Mocking**: External dependencies are mocked appropriately
- **Coverage**: Comprehensive test coverage for critical paths
- **Performance**: Load and performance testing included
- **Documentation**: Well-documented test cases and expected behaviors

### Testing the API

Using curl:
```bash
# Test summarization
curl -X POST http://localhost:5001/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Climate change represents one of the most pressing challenges of our time. Rising global temperatures, caused primarily by increased greenhouse gas emissions from human activities, are leading to melting ice caps, rising sea levels, and more frequent extreme weather events.",
    "task": "summarize"
  }'

# Test health endpoint
curl http://localhost:5000/api/health
```

Using JavaScript fetch:
```javascript
const response = await fetch('http://localhost:5000/api/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your text here...',
    task: 'summarize'
  })
});

const result = await response.json();
console.log(result);
```

### Project Structure

```
prompt-core/
├── 📁 script/
│   ├── 🐍 web_text_processor.py   # Python AI processing logic
│   ├── 📄 prompts.json            # AI prompts configuration
│   └── 📄 requirements.txt        # Python dependencies
├── 🚀 server.js                   # Node.js Express server
├── 📦 package.json               # Node.js dependencies & scripts
├── 🔧 .env                       # Server environment variables
├── 📋 .env.example               # Environment template
├── 🐳 Dockerfile                 # Docker configuration
├── 🚄 railway.json               # Railway deployment config
└── 📖 README.md                  # This file
```
## 🔒 Security

### Security Features
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for secure headers
- **Error Handling**: No sensitive data in error responses
- **Environment Variables**: Sensitive data in environment variables

### Security Best Practices
- Keep OpenAI API key secure and rotate regularly
- Use HTTPS in production
- Configure CORS for specific domains only
- Monitor rate limiting logs
- Regular dependency updates
- Use environment-specific configurations

## 📊 Monitoring

### Health Checks
- **Endpoint**: `GET /api/health`
- **Response Time**: Monitor API response times
- **Error Rates**: Track failed requests
- **Resource Usage**: Monitor CPU and memory

### Logging
- Request/response logging
- Error tracking with stack traces
- Performance metrics
- Security event logging

### Metrics to Monitor
- API response times
- OpenAI API usage and costs
- Error rates and types
- Rate limiting hits
- Server resource usage
