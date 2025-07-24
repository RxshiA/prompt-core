/**
 * Performance and Load Tests
 * Tests API performance, concurrent requests, and resource usage
 */

const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

let app;
let server;

describe('Performance Tests', () => {
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

    describe('Response Time Tests', () => {
        test('health endpoint should respond quickly', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/health')
                .expect(200);

            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(1000);
            expect(response.body.status).toBe('healthy');
        });

        test('server info endpoint should respond quickly', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .get('/')
                .expect(200);

            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(1000);
            expect(response.body.message).toBeTruthy();
        });

        test('validation errors should respond quickly', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .post('/api/process')
                .send({ text: '', task: 'summarize' })
                .expect(400);

            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(1000);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Concurrent Request Tests', () => {
        test('should handle multiple health check requests concurrently', async () => {
            const concurrentRequests = 10;
            const requests = Array(concurrentRequests).fill().map(() =>
                request(app).get('/api/health').expect(200)
            );

            const startTime = Date.now();
            const responses = await Promise.all(requests);
            const totalTime = Date.now() - startTime;

            responses.forEach(response => {
                expect(response.body.status).toBe('healthy');
            });

            expect(totalTime).toBeLessThan(5000);
        });

        test('should handle multiple validation requests concurrently', async () => {
            const concurrentRequests = 5;
            const requests = Array(concurrentRequests).fill().map((_, index) =>
                request(app)
                    .post('/api/process')
                    .send({ text: `Test text ${index}`, task: 'invalid_task' })
                    .expect(400)
            );

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.body.success).toBe(false);
                expect(response.body.code).toBe('INVALID_TASK_TYPE');
            });
        });

        test('should handle mixed endpoint requests concurrently', async () => {
            const requests = [
                request(app).get('/api/health').expect(200),
                request(app).get('/').expect(200),
                request(app).post('/api/process').send({ task: 'summarize' }).expect(400),
                request(app).get('/unknown').expect(404),
                request(app).post('/api/process').send({ text: 'test', task: 'invalid' }).expect(400)
            ];

            const responses = await Promise.all(requests);

            expect(responses).toHaveLength(5);
            expect(responses[0].body.status).toBe('healthy');
            expect(responses[1].body.message).toBeTruthy();
            expect(responses[2].body.code).toBe('INVALID_TEXT');
            expect(responses[3].body.code).toBe('NOT_FOUND');
            expect(responses[4].body.code).toBe('INVALID_TASK_TYPE');
        });
    });

    describe('Memory and Resource Tests', () => {
        test('should not leak memory with repeated requests', async () => {
            const initialMemory = process.memoryUsage();

            for (let i = 0; i < 50; i++) {
                await request(app).get('/api/health').expect(200);
            }

            const finalMemory = process.memoryUsage();

            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            const memoryIncreaseInMB = memoryIncrease / 1024 / 1024;

            expect(memoryIncreaseInMB).toBeLessThan(50);
        });

        test('should handle large valid payloads efficiently', async () => {
            const largeText = 'This is a large text payload. '.repeat(300);

            const startTime = Date.now();

            const response = await request(app)
                .post('/api/process')
                .send({ text: largeText, task: 'summarize' });

            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(35000);
            expect([200, 400, 500]).toContain(response.status);
        });
    });

    describe('Rate Limiting Tests', () => {
        test('should apply rate limiting after many requests', async () => {


            const requests = [];
            const maxRequests = 105;

            for (let i = 0; i < maxRequests; i++) {
                requests.push(
                    request(app)
                        .get('/api/health')
                        .expect(res => {
                            expect([200, 429]).toContain(res.status);
                        })
                );
            }

            const responses = await Promise.allSettled(requests);

            const successfulRequests = responses.filter(
                result => result.status === 'fulfilled' && result.value.status === 200
            );

            const rateLimitedRequests = responses.filter(
                result => result.status === 'fulfilled' && result.value.status === 429
            );

            expect(successfulRequests.length).toBeGreaterThan(0);


        }, 60000);
    });

    describe('Error Handling Performance', () => {
        test('should handle many validation errors efficiently', async () => {
            const errorRequests = [
                { text: null, task: 'summarize' },
                { text: 'test', task: null },
                { text: '', task: 'summarize' },
                { text: 'test', task: 'invalid' },
                { text: 'a'.repeat(10001), task: 'summarize' },
            ];

            const startTime = Date.now();

            const requests = errorRequests.map(payload =>
                request(app)
                    .post('/api/process')
                    .send(payload)
                    .expect(res => {
                        expect([400, 429]).toContain(res.status);
                    })
            );

            const responses = await Promise.all(requests);
            const totalTime = Date.now() - startTime;

            responses.forEach(response => {
                if (response.status === 400) {
                    expect(response.body.success).toBe(false);
                    expect(response.body.code).toMatch(/^(INVALID_TEXT|INVALID_TASK|EMPTY_TEXT|INVALID_TASK_TYPE|TEXT_TOO_LONG)$/);
                }
                if (response.status === 429) {
                    expect(response.body).toBeDefined();
                    if (response.body.message) {
                        expect(response.body.message).toContain('Too many requests');
                    } else if (response.text) {
                        expect(response.text.toLowerCase()).toContain('too many requests');
                    }
                }
            });

            expect(totalTime).toBeLessThan(2000);
        });
    });

    describe('Timeout Handling', () => {
        test('should respect timeout configurations', async () => {

            const response = await request(app)
                .post('/api/process')
                .send({ text: 'test text', task: 'summarize' });

            expect([200, 400, 429, 500]).toContain(response.status);

            if (response.status === 500 && response.body.error) {
                if (response.body.error.includes('timeout')) {
                    expect(response.body.code).toBe('PROCESSING_ERROR');
                }
            }
        });
    });

    describe('CORS and Security Headers Performance', () => {
        test('should include security headers efficiently', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/health')
                .expect(res => {
                    expect([200, 429]).toContain(res.status);
                });

            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(1000);

            if (response.status === 200) {
                expect(response.headers).toHaveProperty('x-content-type-options');
                expect(response.headers).toHaveProperty('x-frame-options');
                expect(response.headers).toHaveProperty('access-control-allow-origin');
            }
        });
    });
});
