import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerModelInfoResource(server: McpServer) {
    server.registerResource(
        "vision-model-info",
        "vision://model/info",
        {
            title: "Vision Model Info",
            description: "Capabilities and configuration of GLM-4.5V via Chutes AI",
            mimeType: "application/json"
        },
        async (uri: URL) => ({
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(
                        {
                            baseURL: "https://llm.chutes.ai/v1",
                            model: "zai-org/GLM-4.5V",
                            capabilities: [
                                "image_understanding",
                                "ui_component_extraction",
                                "layout_description",
                                "visual_hierarchy_analysis"
                            ]
                        },
                        null,
                        2
                    )
                }
            ]
        })
    );
}
