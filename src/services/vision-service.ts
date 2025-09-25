import OpenAI from "openai";
import { loadConfig } from "../server/config.js";
import { AnalysisType, FrameworkType, VisionResult } from "../types/vision-types.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export class VisionService {
    private openai: OpenAI;
    private model: string;

    constructor() {
        const cfg = loadConfig();
        if (!cfg.apiKey) {
            console.warn("OPENAI_API_KEY not set. Vision requests will fail until provided.");
        }
        this.openai = new OpenAI({
            baseURL: cfg.apiBaseUrl,
            apiKey: cfg.apiKey,
            dangerouslyAllowBrowser: true as any
        });
        this.model = cfg.visionModel;
    }

    async analyzeImage(imageUrl: string, analysisType: AnalysisType = "general"): Promise<VisionResult> {
        const prompt = this.getPromptForAnalysisType(analysisType);
        const content = await this.sendImagePrompt(imageUrl, prompt, analysisType);
        return this.toResult(content, analysisType);
    }

    async extractUIComponents(imageUrl: string, componentTypes?: string[]): Promise<VisionResult> {
        const extra = componentTypes && componentTypes.length ? ` Only include these component types when present: ${componentTypes.join(", ")}.` : "";
        const prompt = `Extract UI components with coding-friendly details. For each component:
- name: descriptive identifier
- type: button, input, card, navbar, etc.
- position: {x, y, width, height} in pixels
- styling: {background, border, borderRadius, boxShadow, font properties}
- states: hover, active, disabled styles if visible
- children: nested components
- accessibility: aria-labels, roles if inferable
- confidence: 0.0-1.0 score for detection accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Return as structured JSON array for component generation.${extra}`;
        const content = await this.sendImagePrompt(imageUrl, prompt, "components");
        return this.toResult(content, "components");
    }

    async generateLayoutDescription(imageUrl: string, framework: FrameworkType): Promise<VisionResult> {
        const frameworkSpecific = this.getFrameworkSpecificHints(framework);
        const prompt = `Generate layout specification for ${framework} implementation. Include:
- component_hierarchy: parent-child relationships with nesting
- layout_method: flexbox/grid/absolute with specific properties
- responsive_behavior: how layout adapts to different screen sizes
- spacing_system: consistent margins, paddings, gaps in pixels
- breakpoint_strategy: mobile-first or desktop-first
- alignment_strategy: justify/align items and content
- confidence: 0.0-1.0 score for layout detection accuracy
${frameworkSpecific}

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Provide code-ready structure that can be directly implemented in ${framework}. Return JSON only.`;
        const content = await this.sendImagePrompt(imageUrl, prompt, "layout");
        return this.toResult(content, "layout");
    }

    async analyzeVisualHierarchy(imageUrl: string): Promise<VisionResult> {
        const prompt = `Analyze visual hierarchy with implementation details:
- visual_weight: [{element, weight(1-10), rationale}]
- typography_scale: [{level, font_size, line_height, font_weight}]
- color_system: {primary, secondary, accent, neutral colors with hex values}
- spacing_scale: {base_unit, multipliers for different spacing needs}
- interactive_states: hover, focus, active states differentiation
- design_tokens: ready-to-use CSS variables structure
- confidence: 0.0-1.0 score for hierarchy analysis accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Return JSON suitable for CSS variables and design token generation.`;
        const content = await this.sendImagePrompt(imageUrl, prompt, "general");
        return this.toResult(content, "general");
    }

    private async sendImagePrompt(imageUrl: string, prompt: string, analysisType?: AnalysisType): Promise<string> {
        const resolvedUrl = await this.resolveImageUrl(imageUrl);
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "image_url", image_url: { url: resolvedUrl } } as any,
                            { type: "text", text: prompt } as any
                        ] as any
                    }
                ],
                max_tokens: 8192,
                temperature: this.getTemperature(analysisType)
            });

            return response.choices?.[0]?.message?.content ?? "";
        } catch (err: any) {
            const status = err?.status ?? err?.response?.status;
            const body = err?.response?.data ?? err?.message ?? "";
            const preview = typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body)?.slice(0, 300);
            throw new Error(`Vision API request failed (status=${status ?? "unknown"}). Check OPENAI_API_KEY and image_url accessibility. Details: ${preview}`);
        }
    }

    private async resolveImageUrl(imageUrl: string): Promise<string> {
        if (!imageUrl) return imageUrl;

        // Already a data URL
        if (imageUrl.startsWith("data:")) return imageUrl;

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

    private async readFileAsDataUrl(filePath: string): Promise<string> {
        const buf = await fs.readFile(filePath);
        const mime = this.inferMimeType(filePath);
        const base64 = buf.toString("base64");
        return `data:${mime};base64,${base64}`;
    }

    private inferMimeType(filePath: string): string {
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

    private getPromptForAnalysisType(type: AnalysisType): string {
        const prompts: Record<AnalysisType, string> = {
            general: `Analyze this UI design for coding implementation. Provide structured JSON with:
- components: [{name, type, position: {x,y,width,height}, styling: {colors, typography, spacing}}]
- layout: {gridSystem, spacing: {margin, padding, gap}, alignment}
- design_system: {colors: [{name, hex, usage}], typography: [{element, font, size, weight}]}
- confidence: 0.0-1.0 score for overall analysis accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Focus on details that can be directly converted to CSS/React components. Return JSON only.`,

            ui: `Analyze this UI/UX design for precise implementation. Provide detailed JSON with:
- components: [{name, type, position, styling, states, children, accessibility}]
- layout: {container_type, flex_direction, grid_template, spacing_system}
- interactive_elements: [{type, behavior, states}]
- design_patterns: used patterns and implementation approach
- confidence: 0.0-1.0 score for UI analysis accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Focus on pixel-perfect replication. Return JSON only.`,

            layout: `Extract the layout structure for precise implementation. Provide JSON with:
- component_hierarchy: parent-child relationships with nesting
- layout_method: flexbox/grid/absolute with specific properties
- responsive_behavior: breakpoints and layout changes
- spacing_system: consistent margins, paddings, gaps in pixels
- alignment_strategy: justify/align items and content
- confidence: 0.0-1.0 score for layout detection accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Return JSON suitable for direct CSS/component implementation.`,

            components: `Identify all UI components with implementation details. For each component:
- name: descriptive identifier
- type: button, input, card, navbar, etc.
- position: {x, y, width, height} in pixels
- styling: {background, border, borderRadius, boxShadow, font properties}
- states: hover, active, disabled styles if visible
- children: nested components
- confidence: 0.0-1.0 score for component detection accuracy

**IMPORTANT**:
- If image is unclear, make reasonable assumptions based on visible elements
- Always return valid JSON even with incomplete information
- Focus on implementable details rather than aesthetic descriptions
Return as structured JSON array for component generation.`
        };
        return prompts[type] || prompts.general;
    }

    private getTemperature(type: AnalysisType = "general"): number {
        switch (type) {
            case "general": return 0.30;   // More creative for general analysis
            case "ui": return 0.20;        // More precise for UI components
            case "layout": return 0.25;    // Balanced for layout structure
            case "components": return 0.20; // Very precise for component detection
            default: return 0.25;
        }
    }

    private getFrameworkSpecificHints(framework: FrameworkType): string {
        switch (framework) {
            case "react":
                return `- react_specific: hooks usage, state management suggestions, component composition patterns
- functional_components: prefer functional components with hooks
- props_structure: recommended prop types and default props`;
            case "vue":
                return `- vue_specific: composition API options, reactive state management
- component_structure: single file components organization
- vue_features: directives, computed properties, watchers usage`;
            case "html":
                return `- html_specific: semantic HTML5 elements, accessibility best practices
- css_integration: inline styles vs external classes recommendations
- vanilla_js: DOM manipulation suggestions if needed`;
            case "tailwind":
                return `- tailwind_specific: utility classes, spacing scale, breakpoints
- custom_styles: when to use custom CSS vs Tailwind utilities
- responsive_design: mobile-first approach with Tailwind breakpoints`;
            default:
                return "";
        }
    }

    private toResult(content: string, type: AnalysisType): VisionResult {
        const parsed = this.parseJSON(content);
        if (parsed) return { type, ...parsed, raw: undefined } as VisionResult;
        return { type, raw: content } as VisionResult;
    }

    private parseJSON(content: string): Record<string, unknown> | null {
        if (!content) return null;
        // Try to extract JSON block if wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const candidate = jsonMatch ? jsonMatch[0] : content;
        try {
            return JSON.parse(candidate);
        } catch {
            return null;
        }
    }
}
