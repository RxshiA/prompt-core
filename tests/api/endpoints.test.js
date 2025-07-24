/**
 * API Integration Tests
 * Tests for all API endpoints and their behavior
 */

const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const fixtures = require('../fixtures/responses');

let app;
let server;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    app = require('../../server');
    
    const port = process.env.PORT || 0;
    server = app.listen(port);
    
    await new Promise(resolve => {
      server.on('listening', resolve);
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => {
        server.close(resolve);
      });
    }
  });

  describe('GET /', () => {
    test('should return server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual(fixtures.serverInfoResponse);
    });

    test('should have correct content type', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy'
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should have healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /api/process', () => {
    describe('Input Validation', () => {
      test('should reject request without text', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ task: 'summarize' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidText);
      });

      test('should reject request without task', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 'Sample text' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidTask);
      });

      test('should reject non-string text', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 123, task: 'summarize' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidText);
      });

      test('should reject non-string task', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 'Sample text', task: 123 })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidTask);
      });

      test('should reject invalid task type', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 'Sample text', task: 'invalid_task' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidTaskType);
      });

      test('should reject empty text', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: '', task: 'summarize' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.invalidText);
      });

      test('should reject whitespace-only text', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: '   \n\t   ', task: 'summarize' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.emptyText);
      });

      test('should reject text that is too long', async () => {
        const longText = 'a'.repeat(10001);
        const response = await request(app)
          .post('/api/process')
          .send({ text: longText, task: 'summarize' })
          .expect(400);

        expect(response.body).toMatchObject(fixtures.errorResponses.textTooLong);
      });

      test('should accept text at maximum length', async () => {
        const maxText = 'a'.repeat(10000);
        const response = await request(app)
          .post('/api/process')
          .send({ text: maxText, task: 'summarize' });

        if (response.status === 400) {
          expect(response.body.code).not.toBe('TEXT_TOO_LONG');
        }
      });
    });

    describe('Valid Requests', () => {

      test.each(global.testUtils.validTasks)('should handle %s task', async (task) => {
        const response = await request(app)
          .post('/api/process')
          .send({ 
            text: fixtures.testTexts.technical, 
            task: task 
          });

        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toMatchObject({
            success: true
          });
          expect(response.body.output).toBeDefined();
          expect(typeof response.body.output).toBe('string');
        } else if (response.status === 500) {
          expect(response.body).toMatchObject(global.testUtils.responsePatterns.error);
        }
      });

      test('should handle special characters', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ 
            text: global.testUtils.sampleTexts.special, 
            task: 'summarize' 
          });

        expect([200, 500]).toContain(response.status);
      });

      test('should handle unicode characters', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ 
            text: global.testUtils.sampleTexts.unicode, 
            task: 'summarize' 
          });

        expect([200, 500]).toContain(response.status);
      });

      test('should handle HTML content', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ 
            text: global.testUtils.sampleTexts.html, 
            task: 'summarize' 
          });

        expect([200, 500]).toContain(response.status);
      });

      test('should handle JSON content', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ 
            text: global.testUtils.sampleTexts.json, 
            task: 'classify' 
          });

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('Response Format', () => {
      test('should return JSON response', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 'Sample text', task: 'summarize' })
          .expect('Content-Type', /json/);

        expect(response.body).toHaveProperty('success');
      });

      test('should include required fields in success response', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ text: 'Sample text for testing', task: 'summarize' });

        if (response.status === 200) {
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('output');
          expect(typeof response.body.output).toBe('string');
        }
      });

      test('should include required fields in error response', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ task: 'summarize' }) 
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('code');
      });
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
      });
    });

    test('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to API routes', async () => {
     
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
    });
  });

  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
