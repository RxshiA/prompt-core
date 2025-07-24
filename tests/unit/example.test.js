/**
 * Example Test Suite
 * Demonstrates comprehensive testing patterns and best practices
 */

const { describe, test, expect } = require('@jest/globals');

describe('Example Test Patterns', () => {
    describe('Basic Functionality', () => {
        test('should demonstrate basic test structure', () => {
            const result = 1 + 1;
            expect(result).toBe(2);
        });

        test('should test with multiple assertions', () => {
            const obj = { name: 'test', value: 42 };

            expect(obj).toHaveProperty('name');
            expect(obj.name).toBe('test');
            expect(obj.value).toBeGreaterThan(40);
            expect(obj).toMatchObject({ name: 'test' });
        });
    });

    describe('Async Testing Patterns', () => {
        test('should handle promises', async () => {
            const asyncFunction = () => Promise.resolve('success');

            const result = await asyncFunction();
            expect(result).toBe('success');
        });

        test('should handle promise rejections', async () => {
            const asyncFunction = () => Promise.reject(new Error('test error'));

            await expect(asyncFunction()).rejects.toThrow('test error');
        });

        test('should test with timeout', async () => {
            const slowFunction = () => new Promise(resolve => {
                setTimeout(() => resolve('done'), 100);
            });

            const result = await slowFunction();
            expect(result).toBe('done');
        }, 5000);
    });

    describe('Mock and Spy Patterns', () => {
        test('should demonstrate basic mocking', () => {
            const mockFunction = jest.fn();
            mockFunction.mockReturnValue('mocked value');

            const result = mockFunction();

            expect(mockFunction).toHaveBeenCalled();
            expect(result).toBe('mocked value');
        });

        test('should spy on object methods', () => {
            const obj = {
                method: () => 'original'
            };

            const spy = jest.spyOn(obj, 'method');
            spy.mockReturnValue('spied');

            const result = obj.method();

            expect(spy).toHaveBeenCalled();
            expect(result).toBe('spied');

            spy.mockRestore();
        });
    });

    describe('Error Testing Patterns', () => {
        test('should test error throwing', () => {
            const errorFunction = () => {
                throw new Error('Test error');
            };

            expect(errorFunction).toThrow('Test error');
        });

        test('should test error types', () => {
            const typeErrorFunction = () => {
                throw new TypeError('Type error');
            };

            expect(typeErrorFunction).toThrow(TypeError);
        });
    });

    describe('Data-driven Testing', () => {
        test.each([
            [1, 2, 3],
            [2, 3, 5],
            [10, 20, 30]
        ])('should add %i + %i = %i', (a, b, expected) => {
            expect(a + b).toBe(expected);
        });

        const testCases = [
            { input: 'hello', expected: 5 },
            { input: 'world', expected: 5 },
            { input: 'test', expected: 4 }
        ];

        test.each(testCases)('should calculate length of "$input"', ({ input, expected }) => {
            expect(input.length).toBe(expected);
        });
    });

    describe('Snapshot Testing', () => {
        test('should match snapshot', () => {
            const data = {
                message: 'Hello World',
                timestamp: new Date('2024-01-01T00:00:00.000Z'),
                items: ['item1', 'item2', 'item3']
            };

            expect(data).toMatchSnapshot();
        });
    });

    describe('Performance Testing', () => {
        test('should complete within time limit', async () => {
            const startTime = Date.now();

            await new Promise(resolve => setTimeout(resolve, 10));

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(100);
        });
    });

    describe('Test Utilities', () => {
        test('should use global test utilities', () => {
            expect(global.testUtils).toBeDefined();
            expect(global.testUtils.sampleTexts).toBeDefined();
            expect(global.testUtils.validTasks).toContain('summarize');
        });

        test('should demonstrate custom matchers', () => {
            const responsePattern = {
                success: true,
                output: 'string'
            };

            expect(responsePattern).toMatchObject(global.testUtils.responsePatterns.success);
        });
    });
});
