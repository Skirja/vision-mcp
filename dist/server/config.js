export function loadConfig() {
    return {
        apiBaseUrl: process.env.API_BASE_URL || 'https://api.openai.com/v1',
        visionModel: process.env.VISION_MODEL || 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
        logLevel: (process.env.LOG_LEVEL || 'info')
    };
}
