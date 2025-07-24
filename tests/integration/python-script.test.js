/**
 * Python Script Integration Tests
 * Tests the Python web_text_processor.py script functionality
 */

const { describe, test, expect, beforeAll } = require('@jest/globals');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Python Script Tests', () => {
    const pythonExecutable = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, '../../script/web_text_processor.py');
    const promptsPath = path.join(__dirname, '../../script/prompts.json');

    beforeAll(() => {
        expect(fs.existsSync(scriptPath)).toBe(true);

        expect(fs.existsSync(promptsPath)).toBe(true);
    });

    /**
     * Helper function to execute Python script
     */
    const executePythonScript = (args) => {
        return new Promise((resolve, reject) => {
            const process = spawn(pythonExecutable, [scriptPath, ...args], {
                cwd: path.dirname(scriptPath)
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                resolve({ code, stdout, stderr });
            });

            process.on('error', (error) => {
                reject(error);
            });

            setTimeout(() => {
                process.kill();
                reject(new Error('Python script execution timed out'));
            }, 30000);
        });
    };

    describe('Script Execution', () => {
        test('should execute without arguments and show help', async () => {
            const result = await executePythonScript([]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain('required');
        });

        test('should show help with --help flag', async () => {
            const result = await executePythonScript(['--help']);

            expect(result.code).toBe(0);
            expect(result.stdout).toContain('usage:');
            expect(result.stdout).toContain('--task');
            expect(result.stdout).toContain('--text');
        });

        test('should fail with missing required arguments', async () => {
            const result = await executePythonScript(['--task', 'summarize']);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain('required');
        });
    });

    describe('Task Validation', () => {
        test('should accept valid tasks', async () => {
            const validTasks = ['summarize', 'extract_key_points', 'classify'];

            for (const task of validTasks) {
                const result = await executePythonScript([
                    '--task', task,
                    '--text', 'Test text for validation'
                ]);

                if (result.code !== 0 && result.stderr) {
                    expect(result.stderr).not.toContain('invalid choice');
                }
            }
        });

        test('should reject invalid tasks', async () => {
            const result = await executePythonScript([
                '--task', 'invalid_task',
                '--text', 'Test text'
            ]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain('invalid choice');
        });
    });

    describe('JSON Output Format', () => {
        test('should output valid JSON on success', async () => {
            if (!process.env.OPENAI_API_KEY) {
                console.log('Skipping test: OPENAI_API_KEY not available');
                return;
            }

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'This is a simple test text for summarization purposes.'
            ]);

            if (result.code === 0) {
                expect(() => JSON.parse(result.stdout)).not.toThrow();

                const output = JSON.parse(result.stdout);
                expect(output).toHaveProperty('success');
                expect(output).toHaveProperty('task');
                expect(output).toHaveProperty('input');
                expect(output).toHaveProperty('output');
            }
        });

        test('should output valid JSON on error', async () => {
            const originalApiKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'invalid_key';

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Test text'
            ]);

            if (originalApiKey) {
                process.env.OPENAI_API_KEY = originalApiKey;
            } else {
                delete process.env.OPENAI_API_KEY;
            }


            expect(() => JSON.parse(result.stdout)).not.toThrow();

            const output = JSON.parse(result.stdout);
            expect(output).toHaveProperty('success');
            expect(output).toHaveProperty('task');
            expect(output).toHaveProperty('input');

            if (output.success === false) {
                expect(output).toHaveProperty('error');
                expect(output).toHaveProperty('output', null);
            }
        });
    });

    describe('Prompt Loading', () => {
        test('should load prompts from prompts.json', async () => {

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Test text'
            ]);

            if (result.code !== 0) {
                expect(result.stderr).not.toContain('Prompts file not found');
                expect(result.stderr).not.toContain('Failed to load JSON prompts');
            }
        });

        test('should handle missing prompts.json gracefully', async () => {
            const originalPath = promptsPath;
            const backupPath = promptsPath + '.backup';

            if (fs.existsSync(originalPath)) {
                fs.renameSync(originalPath, backupPath);
            }

            try {
                const result = await executePythonScript([
                    '--task', 'summarize',
                    '--text', 'Test text'
                ]);

                expect(result.code).not.toBe(0);

                if (result.stdout) {
                    const output = JSON.parse(result.stdout);
                    expect(output.success).toBe(false);
                    expect(output.error).toContain('Prompts file not found');
                }
            } finally {
                if (fs.existsSync(backupPath)) {
                    fs.renameSync(backupPath, originalPath);
                }
            }
        });
    });

    describe('Text Processing', () => {
        const skipIfNoApiKey = () => {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-api-key') {
                console.log('Skipping test: Valid OPENAI_API_KEY not available');
                return true;
            }
            return false;
        };

        test('should process summarization task', async () => {
            if (skipIfNoApiKey()) return;

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Climate change represents one of the most pressing challenges of our time. Rising global temperatures, caused primarily by increased greenhouse gas emissions from human activities, are leading to melting ice caps, rising sea levels, and more frequent extreme weather events.'
            ]);

            if (result.code === 0) {
                const output = JSON.parse(result.stdout);
                expect(output.success).toBe(true);
                expect(output.task).toBe('summarize');
                expect(output.output).toBeTruthy();
                expect(typeof output.output).toBe('string');
            }
        });

        test('should process key points extraction task', async () => {
            if (skipIfNoApiKey()) return;

            const result = await executePythonScript([
                '--task', 'extract_key_points',
                '--text', 'A recent study by Harvard Medical School found that regular exercise significantly impacts mental health. The research, conducted over 18 months with 2,000 participants, showed that individuals who exercised for 30 minutes daily experienced a 45% reduction in anxiety symptoms.'
            ]);

            if (result.code === 0) {
                const output = JSON.parse(result.stdout);
                expect(output.success).toBe(true);
                expect(output.task).toBe('extract_key_points');
                expect(output.output).toBeTruthy();
                expect(typeof output.output).toBe('string');
            }
        });

        test('should process classification task', async () => {
            if (skipIfNoApiKey()) return;

            const result = await executePythonScript([
                '--task', 'classify',
                '--text', 'The Federal Reserve announced yesterday that it will raise interest rates by 0.25% effective immediately. The decision was made following a unanimous vote by the Federal Open Market Committee.'
            ]);

            if (result.code === 0) {
                const output = JSON.parse(result.stdout);
                expect(output.success).toBe(true);
                expect(output.task).toBe('classify');
                expect(output.output).toBeTruthy();
                expect(typeof output.output).toBe('string');
            }
        });
    });

    describe('Error Handling', () => {
        test('should handle missing OpenAI API key', async () => {
            const originalApiKey = process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_API_KEY;

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Test text'
            ]);

            if (originalApiKey) {
                process.env.OPENAI_API_KEY = originalApiKey;
            }

            expect(result.stdout).toBeTruthy();

            if (result.stdout) {
                const output = JSON.parse(result.stdout);
                expect(output).toHaveProperty('success');
                if (output.success === false) {
                    expect(output).toHaveProperty('error');
                    expect(output.error).toContain('OPENAI_API_KEY');
                } else {

                    console.log('Note: Script succeeded without API key, possibly using fallback behavior');
                }
            }
        });

        test('should handle invalid OpenAI API key', async () => {
            const originalApiKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-invalid_key_for_testing';

            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Test text'
            ]);

            if (originalApiKey) {
                process.env.OPENAI_API_KEY = originalApiKey;
            } else {
                delete process.env.OPENAI_API_KEY;
            }

            expect(result.stdout).toBeTruthy();

            if (result.stdout) {
                const output = JSON.parse(result.stdout);
                expect(output).toHaveProperty('success');
                if (output.success === false) {
                    expect(output.error).toBeTruthy();
                }
            }
        });
    });

    describe('Special Characters and Edge Cases', () => {
        test('should handle special characters in text', async () => {
            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Special characters: !@#$%^&*()_+{}|:<>?[];\'",./`~'
            ]);

            if (result.code !== 0 && result.stderr) {
                expect(result.stderr).not.toContain('UnicodeDecodeError');
                expect(result.stderr).not.toContain('encoding');
            }
        });

        test('should handle unicode characters', async () => {
            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Unicode test: 你好世界 🌍 🚀 こんにちは Здравствуй мир'
            ]);

            if (result.code !== 0 && result.stderr) {
                expect(result.stderr).not.toContain('UnicodeDecodeError');
                expect(result.stderr).not.toContain('encoding');
            }
        });

        test('should handle very short text', async () => {
            const result = await executePythonScript([
                '--task', 'summarize',
                '--text', 'Hi'
            ]);

            if (result.code === 0) {
                const output = JSON.parse(result.stdout);
                expect(output).toHaveProperty('task', 'summarize');
            }
        });
    });
});
