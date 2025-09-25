import { z } from "zod";
export function registerExtractUiTool(server, vision) {
    server.registerTool("extract_ui_components", {
        title: "Extract UI Components",
        description: "STEP 3: Extract detailed UI components with coding-ready specifications. Use after general analysis to identify specific components (buttons, inputs, cards, navbars, etc.) with position, styling, and interactive elements. Optional component_types parameter to filter specific component types. Returns structured data ready for component implementation.",
        inputSchema: {
            image_url: z
                .string()
                .min(1)
                .describe("Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"),
            component_types: z.array(z.string()).optional()
        }
    }, async ({ image_url, component_types }) => {
        const result = await vision.extractUIComponents(image_url, component_types);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
