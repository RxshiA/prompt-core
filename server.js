const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins in development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Python script path
const PYTHON_SCRIPT_PATH = path.join(__dirname, 'script', 'web_text_processor.py');
const PYTHON_EXECUTABLE = process.env.PYTHON_PATH || '/app/venv/bin/python';
console.log(`Using Python executable: ${PYTHON_EXECUTABLE}`);
console.log(`Python script path: ${PYTHON_SCRIPT_PATH}`);

/**
 * Execute Python script with given parameters
 * @param {string} text - Text to process
 * @param {string} task - Task to perform
 * @returns {Promise} Promise that resolves with the result
 */
function executePythonScript(text, task) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [
      PYTHON_SCRIPT_PATH,
      '--task', task,
      '--text', text
    ], {
      cwd: path.join(__dirname, 'script'),
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python script execution timed out'));
    }, 30000); // 30 seconds timeout
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Text Processor Backend API',
    version: '1.0.0',
    endpoints: {
      process: 'POST /api/process'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/process', async (req, res) => {
  try {
    const { text, task } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
        code: 'INVALID_TEXT'
      });
    }

    if (!task || typeof task !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Task is required and must be a string',
        code: 'INVALID_TASK'
      });
    }

    // Validate task type
    const validTasks = ['summarize', 'extract_key_points', 'classify'];
    if (!validTasks.includes(task)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task. Must be one of: ${validTasks.join(', ')}`,
        code: 'INVALID_TASK_TYPE'
      });
    }

    // Validate text length
    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long. Maximum 10,000 characters allowed.',
        code: 'TEXT_TOO_LONG'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text cannot be empty',
        code: 'EMPTY_TEXT'
      });
    }

    console.log(`Processing request: task=${task}, text_length=${text.length}`);

    // Execute Python script
    const result = await executePythonScript(text, task);

    // Log result
    console.log(`Processing completed: success=${result.success}`);

    // Only return the output to the frontend
    if (result.success) {
      res.json({
        success: true,
        output: result.output
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Processing failed',
        code: 'PROCESSING_ERROR'
      });
    }

  } catch (error) {
    console.error('Error in /api/process:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'PROCESSING_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔄 Process endpoint: http://localhost:${PORT}/api/process`);
});
