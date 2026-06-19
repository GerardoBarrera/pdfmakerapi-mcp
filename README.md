# PDFMakerAPI MCP server

[![npm](https://img.shields.io/npm/v/@pdfmakerapi/mcp)](https://www.npmjs.com/package/@pdfmakerapi/mcp)
[![smithery badge](https://smithery.ai/badge/gerardobarrera714/pdfmakerapi)](https://smithery.ai/servers/gerardobarrera714/pdfmakerapi)

An [MCP](https://modelcontextprotocol.io) server for **[PDFMakerAPI](https://pdfmakerapi.com)**. It
exposes a single `create_document` tool that turns a document description into a **shareable link**
which opens in the PDFMakerAPI editor — preview, edit any field, and download the PDF.

Works with any MCP client: **Claude Desktop**, **Cursor**, **Windsurf**, **Cline**, **Zed**, etc.

It's a thin client of the public API at `https://api.pdfmakerapi.com`, so it needs no server,
account, or credentials of its own.

## What it does

The `create_document` tool accepts a PDFMakerAPI Document (invoice, certificate, report, resume,
letter, …) built by the calling model, stores it via `POST /api/v1/documents`, and returns a link
like `https://app.pdfmakerapi.com/d/<id>`.

## Use it

### Claude Desktop

Edit `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "pdfmakerapi": {
      "command": "npx",
      "args": ["-y", "@pdfmakerapi/mcp"]
    }
  }
}
```

Restart Claude Desktop, then ask: *"Make a professional invoice for Acme with 3 line items."*

### Cursor / Windsurf / Cline / Zed

Add the same server to the client's MCP config:

```json
{
  "mcpServers": {
    "pdfmakerapi": { "command": "npx", "args": ["-y", "@pdfmakerapi/mcp"] }
  }
}
```

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `PDFMAKERAPI_BASE_URL` | `https://api.pdfmakerapi.com` | Point the tool at a different API (e.g. `http://localhost:3001` for local dev). |

## Develop

```bash
git clone https://github.com/GerardoBarrera/pdfmakerapi-mcp.git
cd pdfmakerapi-mcp
npm install
npm run build   # compile to dist/
npm run dev     # run from source (tsx)
```

## License

MIT
