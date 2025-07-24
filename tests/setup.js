/**
 * Jest Test Setup
 * Configures environment variables and global test settings
 */

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key';
process.env.PYTHON_PATH = process.env.PYTHON_PATH || 'python3';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
}

// Global test utilities
global.testUtils = {
    // Sample test data
    sampleTexts: {
        short: "This is a short test text.",
        medium: "Climate change represents one of the most pressing challenges of our time. Rising global temperatures, caused primarily by increased greenhouse gas emissions from human activities, are leading to melting ice caps, rising sea levels, and more frequent extreme weather events.",
        long: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(100),
        empty: "",
        whitespace: "   \n\t   ",
        maxLength: "a".repeat(10000),
        tooLong: "a".repeat(10001),
        special: "Special characters: !@#$%^&*()_+{}|:<>?[];',./`~",
        unicode: "Unicode: 你好世界 🌍 🚀 こんにちは",
        html: "<html><body><h1>HTML Content</h1><p>This is a paragraph.</p></body></html>",
        json: '{"key": "value", "number": 123, "array": [1,2,3]}',
        code: 'function hello() { console.log("Hello World"); }'
    },

    // Valid task types
    validTasks: ['summarize', 'extract_key_points', 'classify'],

    // Invalid task types
    invalidTasks: ['invalid', 'unknown', '', null, undefined, 123],

    // Common response patterns
    responsePatterns: {
        success: {
            success: true,
            output: 'string'
        },
        error: {
            success: false,
            error: 'string',
            code: 'string'
        }
    }
};
