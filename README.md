# Vision MCP Server

Vision MCP Server adalah MCP (Model Context Protocol) server yang berfungsi sebagai "mata" untuk model AI yang tidak memiliki kemampuan bawaan untuk memproses gambar. Server ini memungkinkan model coding untuk menganalisis gambar melalui API yang kompatibel dengan OpenAI.

## Cara Kerja

Vision MCP Server menjembatani komunikasi antara model coding (tanpa vision capabilities) dan vision model yang mendukung analisis gambar. Prosesnya sederhana:

1. Model coding memberikan prompt dan path gambar ke MCP server
2. Server mengkonversi gambar ke format base64
3. Server mengirimkan prompt dan gambar ke vision model via API
4. Server mengembalikan hasil analisis ke model coding

## Fitur Utama

- **Vision API Integration**: Menghubungkan model tanpa kemampuan vision dengan Vision Model
- **Multi-Image Support**: Dapat menganalisis 1-10 gambar dalam satu permintaan
- **Flexible Prompts**: Mendukung berbagai jenis permintaan (analisis UI, diagram, perbandingan dll)
- **OpenAI Compatible**: Bekerja dengan berbagai provider yang kompatibel dengan OpenAI API
- **Comprehensive Error Handling**: Penanganan error yang informatif dan user-friendly

## Persyaratan

- Node.js 18+ atau Bun 1.0+
- API Key untuk vision model yang kompatibel dengan OpenAI

## Instalasi

```bash
# Clone repository
git clone <repository-url>
cd vision-mcp

# Install dependencies
bun install

# Build project
bun run build
```

## Konfigurasi

Server memerlukan environment variables berikut:

```bash
# Required
VISION_API_KEY=your_api_key_here

# Optional
VISION_API_BASE_URL=https://api.openai.com/v1  # Default: https://api.openai.com/v1
VISION_MODEL_NAME=gpt-4o                      # Default: gpt-4o
VISION_MAX_TOKENS=32000                       # Default: 32000
```

### Provider Vision Model yang Didukung

Vision MCP Server dapat bekerja dengan berbagai provider yang kompatibel dengan OpenAI API:

1. **OpenAI**: Gunakan model seperti `gpt-4o` atau `gpt-4-vision-preview`
2. **Custom Providers**: Atur `VISION_API_BASE_URL` ke endpoint provider Anda
3. **Local Models**: Gunakan dengan server vLLM atau Ollama yang mendukung OpenAI-compatible API
4. **Cloud Providers**: Banyak cloud provider menyediakan endpoint yang kompatibel

## Penggunaan dengan MCP Client

### Konfigurasi untuk Claude Desktop

Tambahkan konfigurasi berikut ke `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vision-mcp": {
      "command": "bun",
      "args": ["/path/to/vision-mcp/dist/index.js"],
      "env": {
        "VISION_API_BASE_URL": "https://llm.chutes.ai/v1",
        "VISION_API_KEY": "your_api_key",
        "VISION_MODEL_NAME": "Qwen/Qwen3-VL-235B-A22B-Instruct",
        "VISION_MAX_TOKENS": "32000"
      }
    }
  }
}
```

### Contoh Penggunaan

Setelah dikonfigurasi, Anda dapat meminta model untuk menganalisis gambar seperti:

```
"Analisis UI berikut dan berikan feedback tentang penggunaannya: /path/to/ui-screenshot.png"
```

```
"Bandingkan kedua desain berikut dan sebutkan perbedaannya: /path/to/design1.png /path/to/design2.png"
```

```
"Jelaskan alur yang ditunjukkan dalam diagram ini: /path/to/flow-diagram.png"
```

#### Contoh dengan Claude Desktop

Di chat Claude Desktop, Anda bisa menulis:

```
Tolong analisis screenshot ini berikan masukan untuk UX improvement: /home/user/screenshots/app-login.png
```

Claude akan menggunakan Vision MCP Server untuk menganalisis gambar dan memberikan feedback.

## Format Gambar yang Didukung

- JPG/JPEG
- PNG
- GIF
- WebP
- BMP

## Batasan

- Maksimum 10 gambar per permintaan
- Ukuran file maksimum 10MB per gambar
- Path gambar harus absolute path atau valid relative path
- Memerlukan koneksi internet untuk komunikasi dengan API

## Struktur Proyek

```
vision-mcp/
├── src/
│   ├── index.ts           # Entry point utama
│   ├── vision-tool.ts     # Implementasi vision tool
│   ├── vision-client.ts   # Client untuk OpenAI API
│   ├── file-handler.ts    # Utilitas pemrosesan file
│   └── types.ts           # Tipe dan schema
├── dist/                  # Output hasil build
├── package.json
├── tsconfig.json
└── README.md
```

## Pengembangan

```bash
# Development mode dengan auto-reload
bun run dev

# Type checking
bun run typecheck

# Build untuk produksi
bun run build

# Jalankan server
bun start
```

## Testing

### Testing dengan Client

Gunakan file test client yang disediakan:

```bash
# Set environment variables
export VISION_API_KEY="your_api_key"

# Run test client
node examples/test_client.js
```

### Langkah Testing

1. **Pastikan environment variables terkonfigurasi**
   ```bash
   export VISION_API_BASE_URL="https://api.openai.com/v1"
   export VISION_API_KEY="your_api_key"
   export VISION_MODEL_NAME="gpt-4o"
   ```

2. **Start MCP server**
   ```bash
   bun start
   ```

3. **Test dengan MCP client** (Claude Desktop, Cursor, dll)
4. **Verifikasi vision tool tersedia** dan berfungsi dengan gambar uji

## Troubleshooting

### Error Common Issues

1. **"Image file not found"**: Pastikan path file benar dan file dapat diakses
2. **"Authentication failed"**: Periksa VISION_API_KEY Anda
3. **"Model not found"**: Pastikan VISION_MODEL_NAME valid untuk API Anda
4. **"Rate limit exceeded"**: Tunggu beberapa saat sebelum mencoba lagi

### Tips Tambahan

1. **Gunakan absolute paths** untuk menghindari masalah path resolution
2. **Batas ukuran gambar**: Optimalkan gambar besar sebelum menganalisis
3. **Cache respons**: Untuk gambar yang sama diulang, pertimbangkan cache
4. **Monitoring**: Monitor penggunaan API untuk menghindari rate limits

## Lisensi

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## Changelog

### v1.0.0
- Initial release
- Single vision tool implementation
- Support for multiple image formats
- OpenAI-compatible API integration
- Comprehensive error handling
