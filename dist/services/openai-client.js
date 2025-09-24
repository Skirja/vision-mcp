import OpenAI from "openai";
import { loadConfig } from "../server/config.js";
export function createOpenAI() {
    const cfg = loadConfig();
    const client = new OpenAI({
        baseURL: cfg.apiBaseUrl,
        apiKey: cfg.apiKey,
        dangerouslyAllowBrowser: true
    });
    return client;
}
