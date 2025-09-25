# Vision MCP Server

MCP server that adds visual understanding capabilities to text-only coding models. Supports OpenAI GPT-4V and compatible vision APIs.

## Features
- **Tools**: analyze_image, extract_ui_components, generate_layout_description, analyze_visual_hierarchy
- **Resources**: vision-model-info, analysis-templates  
- **Prompts**: code-generation-prompt
- **File Support**: Local files (relative/absolute paths), file:// URLs, http(s) URLs, data URIs

## Installation & Setup

### Requirements
- Node.js >= 18

### Environment Configuration
```bash
# Required: OpenAI API Key (or compatible provider)
OPENAI_API_KEY=your_api_key_here

# Optional: Custom API endpoint (defaults to OpenAI)
API_BASE_URL=https://api.openai.com/v1

# Optional: Vision model (defaults to gpt-4o)
VISION_MODEL=gpt-4o
```

### Provider Examples

**OpenAI (Default):**
```bash
OPENAI_API_KEY=sk-...
# API_BASE_URL=https://api.openai.com/v1 (default)
# VISION_MODEL=gpt-4o (default)
```

**Chutes AI:**
```bash
OPENAI_API_KEY=cpk_...
API_BASE_URL=https://llm.chutes.ai/v1
VISION_MODEL=zai-org/GLM-4.5V
```

**Other Compatible Providers:**
```bash
OPENAI_API_KEY=your_key
API_BASE_URL=https://your-provider.com/v1
VISION_MODEL=your-vision-model
```

## Running the Server

### Development and Running
```bash
npm install
npm run build
```

## MCP Client Integration

### Roo Code (VS Code Extension)
```json
{
  "vision-mcp": {
    "command": "node",
    "args": ["./bin/vision-mcp"],
    "type": "stdio",
    "cwd": "/path/to/vision-mcp",
    "env": {
      "OPENAI_API_KEY": "your_api_key_here",
      "API_BASE_URL": "https://api.openai.com/v1",
      "VISION_MODEL": "gpt-4o"
    },
    "alwaysAllow": ["analyze_image", "extract_ui_components"]
  }
}
```

## Usage Examples

### Analyze UI Screenshot
```json
{
  "image_url": "./screenshot.png",
  "analysis_type": "ui"  
}
```

### Extract Components from Design
```json
{
  "image_url": "https://example.com/design.jpg",
  "component_types": ["button", "input", "card"]
}
```

### Generate Layout Description
```json
{
  "image_url": "file:///C:/designs/layout.png",
  "framework": "react"
}
```

## Recommended Workflow

For the best results when analyzing UI/UX designs, follow this step-by-step workflow:

### Step 1: Initial Analysis
**Tool**: `analyze_image` with `analysis_type: "general"`
**Purpose**: Get a comprehensive overview of the image to understand its type, components, and general structure
```json
{
  "image_url": "./design.png",
  "analysis_type": "general"
}
```

### Step 2: Visual Hierarchy Analysis
**Tool**: `analyze_visual_hierarchy`
**Purpose**: Understand the design system foundations - colors, typography, spacing, and visual weight
```json
{
  "image_url": "./design.png"
}
```

### Step 3: Component Extraction
**Tool**: `extract_ui_components`
**Purpose**: Identify specific UI components with detailed specifications for implementation
```json
{
  "image_url": "./design.png",
  "component_types": ["button", "input", "card"]  // Optional: filter specific components
}
```

### Step 4: Layout Generation
**Tool**: `generate_layout_description` with your target framework
**Purpose**: Generate framework-specific implementation structure
```json
{
  "image_url": "./design.png",
  "framework": "react"  // Options: react, vue, html, tailwind
}
```

### Workflow Benefits
- **Progressive Understanding**: Each step builds on the previous analysis
- **Comprehensive Coverage**: From general overview to specific implementation details
- **Framework-Ready**: Final step provides targeted implementation guidance
- **Flexible**: Can skip steps if you already have specific requirements

### Quick Start Options
- **For quick analysis**: Use only `analyze_image` with appropriate `analysis_type`
- **For component extraction**: Skip to `extract_ui_components` if you only need components
- **For layout implementation**: Use `generate_layout_description` directly if you have a design

## Supported Image Formats
- **Local files**: `./image.jpg`, `C:/path/image.png`, `/path/to/image.jpg`
- **File URLs**: `file:///C:/path/image.png`
- **Web URLs**: `https://example.com/image.jpg`
- **Data URIs**: `data:image/jpeg;base64,...`

## License
MIT
