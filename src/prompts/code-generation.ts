import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCodeGenerationPrompt(server: McpServer) {
    server.registerPrompt(
        "code-generation-prompt",
        {
            title: "Code Generation Prompt",
            description: "Template prompt for generating code from visual analysis",
            argsSchema: {
                framework: z.enum(["react", "vue", "html", "tailwind"]).describe("Target framework"),
                component_type: z.string().optional().describe("Optional component type to focus"),
                style_preference: z.string().optional().describe("Styling preference or constraints")
            }
        },
        ({ framework, component_type, style_preference }: { framework: "react" | "vue" | "html" | "tailwind"; component_type?: string; style_preference?: string }) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Given the visual analysis results, generate ${framework} code${component_type ? ` for component type ${component_type}` : ""
                            }. ${style_preference ? `Style preference: ${style_preference}.` : ""}`
                    }
                }
            ]
        })
    );
}
