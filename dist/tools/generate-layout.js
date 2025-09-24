import { z } from "zod";
export function registerGenerateLayoutTool(server, vision) {
    server.registerTool("generate_layout_description", {
        title: "Generate Layout Description",
        description: "Generate layout description for coding",
        inputSchema: {
            image_url: z.string().url(),
            framework: z.enum(["react", "vue", "html", "tailwind"])
        }
    }, async ({ image_url, framework }) => {
        const result = await vision.generateLayoutDescription(image_url, framework);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
