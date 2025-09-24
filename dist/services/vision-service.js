import OpenAI from "openai";
import { loadConfig } from "../server/config.js";
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
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: imageUrl } },
                        { type: "text", text: prompt }
                    ]
                }
            ],
            max_tokens: 1200,
            temperature: 0.1
        });
        return response.choices?.[0]?.message?.content ?? "";
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
