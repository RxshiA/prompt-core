# Backend Component

Node.js Express server that handles API requests and communicates with the Python script.

## Files

- `server.js` - Main Express server
- `package.json` - Node.js dependencies
- `.env` - Environment variables

## API Endpoints

### POST /api/process
Process text using AI.

**Request:**
```json
{
  "text": "Your text here...",
  "task": "summarize"
}
```

**Response:**
```json
{
  "success": true,
  "task": "summarize", 
  "input": "Your text here...",
  "output": "AI result..."
}
```

### GET /api/health
Check server health.

### GET /
Server information.

## Setup

```bash
npm install
npm run dev  # Development with auto-reload
npm start    # Production
```

## Environment Variables

```
PORT=5000
FRONTEND_URL=http://localhost:3000
PYTHON_PATH=python
NODE_ENV=development
```

## Features

- CORS enabled
- Rate limiting (100 req/15min per IP)
- Security headers
- Input validation
- Error handling
- Timeout protection (30s)
