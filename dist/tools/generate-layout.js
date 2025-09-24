import { z } from "zod";
export function registerGenerateLayoutTool(server, vision) {
    server.registerTool("generate_layout_description", {
        title: "Generate Layout Description",
        description: "Generate layout description for coding",
        inputSchema: {
            image_url: z
                .string()
                .min(1)
                .describe("Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"),
            framework: z.enum(["react", "vue", "html", "tailwind"]).describe("Target output framework")
        }
    }, async ({ image_url, framework }) => {
        const result = await vision.generateLayoutDescription(image_url, framework);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
