import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
export function registerTemplatesResource(server) {
    server.registerResource("analysis-templates", new ResourceTemplate("vision://templates/{type}", { list: undefined }), {
        title: "Analysis Templates",
        description: "Prompt templates for various visual analysis types"
    }, async (uri, { type }) => {
        const templates = {
            general: "Analyze this image and provide a detailed description including main elements, colors, layout, and purpose. Return JSON only.",
            ui: "Analyze this UI/UX design. Identify components, layout structure, interactive elements, and design patterns. Return JSON only.",
            layout: "Extract the layout structure from this design. Describe the grid system, spacing, and component arrangement. Return JSON only.",
            components: "Identify all UI components in this design. For each component, provide type, position, and description. Return JSON only."
        };
        const key = String(type ?? "general");
        const text = templates[key] ?? templates.general;
        return {
            contents: [
                {
                    uri: uri.href,
                    text
                }
            ]
        };
    });
}
