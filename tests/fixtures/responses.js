/**
 * Test Fixtures
 * Sample data and mock responses for testing
 */

module.exports = {
    openaiResponses: {
        summarize: {
            success: {
                success: true,
                task: "summarize",
                input: "Climate change represents one of the most pressing challenges of our time...",
                output: "Climate change, driven by human-caused greenhouse gas emissions, is causing rising temperatures, melting ice caps, and extreme weather events. Scientists emphasize the urgent need for immediate carbon emission reductions to prevent irreversible ecosystem damage."
            }
        },

        extractKeyPoints: {
            success: {
                success: true,
                task: "extract_key_points",
                input: "A recent study by Harvard Medical School found that regular exercise significantly impacts mental health...",
                output: "• Harvard study demonstrates strong link between regular exercise and improved mental health\n• Daily 30-minute exercise routine reduces anxiety symptoms by 45% over 18 months\n• Group exercises prove more effective than solo workouts for mental health benefits"
            }
        },

        classify: {
            success: {
                success: true,
                task: "classify",
                input: "The Federal Reserve announced yesterday that it will raise interest rates by 0.25%...",
                output: "**Classification:** NEWS\n**Confidence Level:** High\n**Reasoning:** This text reports a recent, specific event (Federal Reserve announcement) with factual details including timing and specific data."
            }
        }
    },

    errorResponses: {
        invalidText: {
            success: false,
            error: 'Text is required and must be a string',
            code: 'INVALID_TEXT'
        },

        invalidTask: {
            success: false,
            error: 'Task is required and must be a string',
            code: 'INVALID_TASK'
        },

        invalidTaskType: {
            success: false,
            error: 'Invalid task. Must be one of: summarize, extract_key_points, classify',
            code: 'INVALID_TASK_TYPE'
        },

        textTooLong: {
            success: false,
            error: 'Text is too long. Maximum 10,000 characters allowed.',
            code: 'TEXT_TOO_LONG'
        },

        emptyText: {
            success: false,
            error: 'Text cannot be empty',
            code: 'EMPTY_TEXT'
        },

        processingError: {
            success: false,
            error: 'Internal server error',
            code: 'PROCESSING_ERROR'
        }
    },

    testTexts: {
        news: "The Federal Reserve announced yesterday that it will raise interest rates by 0.25% effective immediately. The decision was made following a unanimous vote by the Federal Open Market Committee. This marks the third rate increase this year, bringing the federal funds rate to 5.5%.",

        fact: "Water boils at 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure. This physical property occurs because the vapor pressure of water equals the surrounding atmospheric pressure at this temperature, causing rapid vaporization throughout the liquid.",

        opinion: "I believe the new smartphone design is absolutely terrible. The camera placement looks awkward, and the color options are uninspiring. Apple should have stuck with their previous design approach, which was far more elegant and user-friendly.",

        technical: "Machine learning algorithms use statistical techniques to give computer systems the ability to learn from data without being explicitly programmed. Deep learning, a subset of machine learning, uses neural networks with multiple layers to model and understand complex patterns in data.",

        narrative: "Once upon a time, in a small village nestled between rolling hills and a crystal-clear river, there lived a young baker named Elena. Every morning, she would wake before dawn to prepare fresh bread for the villagers, filling the air with the warm, comforting aroma of baking."
    },

    pythonScriptResponses: {
        success: {
            success: true,
            task: "summarize",
            input: "test input",
            output: "test output"
        },

        failure: {
            success: false,
            error: "OpenAI API Error: Invalid API key",
            task: "summarize",
            input: "test input",
            output: null
        }
    },

    healthResponse: {
        status: 'healthy',
        timestamp: 'string',
        uptime: 'number'
    },

    serverInfoResponse: {
        message: 'Text Processor Backend API',
        version: '1.0.0',
        endpoints: {
            process: 'POST /api/process'
        }
    }
};
