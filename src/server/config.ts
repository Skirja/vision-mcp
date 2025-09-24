export interface Config {
    apiBaseUrl: string;
    visionModel: string;
    apiKey: string | undefined;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(): Config {
    return {
        apiBaseUrl: process.env.API_BASE_URL || 'https://llm.chutes.ai/v1',
        visionModel: process.env.VISION_MODEL || 'zai-org/GLM-4.5V',
        apiKey: process.env.CHUTES_API_KEY,
        logLevel: ((process.env.LOG_LEVEL as any) || 'info')
    };
}
