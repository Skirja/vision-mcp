import OpenAI from "openai";
import { loadConfig } from "../server/config.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
export class VisionService {
    openai;
    model;
    constructor() {
        const cfg = loadConfig();
        if (!cfg.apiKey) {
            console.warn("CHUTES_API_KEY not set. Vision requests will fail until provided.");
        }
        this.openai = new OpenAI({
            baseURL: cfg.apiBaseUrl,
            apiKey: cfg.apiKey,
            dangerouslyAllowBrowser: true
        });
        this.model = cfg.visionModel;
    }
    async analyzeImage(imageUrl, analysisType = "general") {
        const prompt = this.getPromptForAnalysisType(analysisType);
        const content = await this.sendImagePrompt(imageUrl, prompt);
        return this.toResult(content, analysisType);
    }
    async extractUIComponents(imageUrl, componentTypes) {
        const extra = componentTypes && componentTypes.length ? ` Only include these component types when present: ${componentTypes.join(", ")}.` : "";
        const prompt = `Identify all UI components in this design. For each component, provide type, position (x,y,width,height), and a concise description. Return JSON only.${extra}`;
        const content = await this.sendImagePrompt(imageUrl, prompt);
        return this.toResult(content, "components");
    }
    async generateLayoutDescription(imageUrl, framework) {
        const prompt = `Extract the layout structure for framework=${framework}. Describe the layout tree, grouping, and container structure. Provide a structured JSON with {framework, structure, notes}.`;
        const content = await this.sendImagePrompt(imageUrl, prompt);
        return this.toResult(content, "layout");
    }
    async analyzeVisualHierarchy(imageUrl) {
        const prompt = "Analyze visual hierarchy, color roles, spacing rhythm, and typography scale. Return JSON with {hierarchy:[{level,element,rationale}], colors:[{name,hex,role}], spacing, typography}.";
        const content = await this.sendImagePrompt(imageUrl, prompt);
        return this.toResult(content, "general");
    }
    async sendImagePrompt(imageUrl, prompt) {
        const resolvedUrl = await this.resolveImageUrl(imageUrl);
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "image_url", image_url: { url: resolvedUrl } },
                            { type: "text", text: prompt }
                        ]
                    }
                ],
                max_tokens: 1200,
                temperature: 0.1
            });
            return response.choices?.[0]?.message?.content ?? "";
        }
        catch (err) {
            const status = err?.status ?? err?.response?.status;
            const body = err?.response?.data ?? err?.message ?? "";
            const preview = typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body)?.slice(0, 300);
            throw new Error(`Vision API request failed (status=${status ?? "unknown"}). Check CHUTES_API_KEY and image_url accessibility. Details: ${preview}`);
        }
    }
    async resolveImageUrl(imageUrl) {
        if (!imageUrl)
            return imageUrl;
        // Already a data URL
        if (imageUrl.startsWith("data:"))
            return imageUrl;
        // file:// URL
        if (imageUrl.startsWith("file://")) {
            const filePath = fileURLToPath(imageUrl);
            return await this.readFileAsDataUrl(filePath);
        }
        // Windows absolute path like C:\path\to\file.jpg or C:/path/to/file.jpg
        if (/^[a-zA-Z]:[\\\/]/.test(imageUrl)) {
            return await this.readFileAsDataUrl(imageUrl);
        }
        // Relative path - resolve relative to CWD
        if (!imageUrl.startsWith("http") && !imageUrl.includes("://")) {
            const absolutePath = path.resolve(imageUrl);
            return await this.readFileAsDataUrl(absolutePath);
        }
        // HTTP(S) or others - pass through
        return imageUrl;
    }
    async readFileAsDataUrl(filePath) {
        const buf = await fs.readFile(filePath);
        const mime = this.inferMimeType(filePath);
        const base64 = buf.toString("base64");
        return `data:${mime};base64,${base64}`;
    }
    inferMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".webp":
                return "image/webp";
            case ".gif":
                return "image/gif";
            case ".bmp":
                return "image/bmp";
            case ".svg":
                return "image/svg+xml";
            default:
                return "application/octet-stream";
        }
    }
    getPromptForAnalysisType(type) {
        const prompts = {
            general: "Analyze this image and provide a detailed description including main elements, colors, layout, and purpose. Return JSON only.",
            ui: "Analyze this UI/UX design. Identify components, layout structure, interactive elements, and design patterns. Return JSON only.",
            layout: "Extract the layout structure from this design. Describe the grid system, spacing, and component arrangement. Return JSON only.",
            components: "Identify all UI components in this design. For each component, provide type, position, and description. Return JSON only."
        };
        return prompts[type] || prompts.general;
    }
    toResult(content, type) {
        const parsed = this.parseJSON(content);
        if (parsed)
            return { type, ...parsed, raw: undefined };
        return { type, raw: content };
    }
    parseJSON(content) {
        if (!content)
            return null;
        // Try to extract JSON block if wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const candidate = jsonMatch ? jsonMatch[0] : content;
        try {
            return JSON.parse(candidate);
        }
        catch {
            return null;
        }
    }
}
