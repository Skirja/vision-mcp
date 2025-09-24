import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAnalyzeImageTool } from "../tools/analyze-image.js";
import { registerExtractUiTool } from "../tools/extract-ui.js";
import { registerGenerateLayoutTool } from "../tools/generate-layout.js";
import { registerAnalyzeHierarchyTool } from "../tools/analyze-hierarchy.js";
import { registerModelInfoResource } from "../resources/model-info.js";
import { registerTemplatesResource } from "../resources/templates.js";
import { registerCodeGenerationPrompt } from "../prompts/code-generation.js";
import { VisionService } from "../services/vision-service.js";

export class VisionMCPServer {
    private server: McpServer;
    private vision: VisionService;

    constructor() {
        this.server = new McpServer({ name: "vision-mcp-server", version: "0.1.0" });
        this.vision = new VisionService();

        // Tools
        registerAnalyzeImageTool(this.server, this.vision);
        registerExtractUiTool(this.server, this.vision);
        registerGenerateLayoutTool(this.server, this.vision);
        registerAnalyzeHierarchyTool(this.server, this.vision);

        // Resources
        registerModelInfoResource(this.server);
        registerTemplatesResource(this.server);

        // Prompts
        registerCodeGenerationPrompt(this.server);
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}

export async function start() {
    const app = new VisionMCPServer();
    await app.start();
}

// If executed directly (useful in dev mode)
if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}
