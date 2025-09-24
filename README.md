# Vision MCP Server

MCP server yang menambahkan kemampuan visual understanding (GLM-4.5V via Chutes AI) untuk model coding teks-only.

## Fitur
- Tools: analyze_image, extract_ui_components, generate_layout_description, analyze_visual_hierarchy
- Resources: vision-model-info, analysis-templates
- Prompts: code-generation-prompt

## Instalasi & Menjalankan
- Node.js >= 18 diperlukan.

Konfigurasi environment:
- CHUTES_API_KEY
- VISION_MODEL (default: zai-org/GLM-4.5V)
- API_BASE_URL (default: https://llm.chutes.ai/v1)

Jalankan:
```
npm install
npm run build
npm start
```

Atau via npx setelah publish:
```
npx vision-mcp-server
```

Integrasi MCP Client (contoh Claude Desktop):
```
{
  "mcpServers": {
    "vision-mcp": {
      "command": "npx",
      "args": ["vision-mcp-server"],
      "env": { "CHUTES_API_KEY": "your_api_key" }
    }
  }
}
```
