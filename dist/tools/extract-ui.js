import { z } from "zod";
export function registerExtractUiTool(server, vision) {
    server.registerTool("extract_ui_components", {
        title: "Extract UI Components",
        description: "Identify UI components in the image",
        inputSchema: {
            image_url: z.string().url(),
            component_types: z.array(z.string()).optional()
        }
    }, async ({ image_url, component_types }) => {
        const result = await vision.extractUIComponents(image_url, component_types);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
