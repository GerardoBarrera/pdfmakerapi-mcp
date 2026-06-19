# PDFMakerAPI MCP server

[![npm](https://img.shields.io/npm/v/@pdfmakerapi/mcp)](https://www.npmjs.com/package/@pdfmakerapi/mcp)
[![smithery badge](https://smithery.ai/badge/gerardobarrera714/pdfmakerapi)](https://smithery.ai/servers/gerardobarrera714/pdfmakerapi)
[![Glama score](https://glama.ai/mcp/servers/GerardoBarrera/pdfmakerapi-mcp/badges/score.svg)](https://glama.ai/mcp/servers/GerardoBarrera/pdfmakerapi-mcp)
[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-000?logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=pdfmakerapi&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwZGZtYWtlcmFwaS9tY3AiXX0=)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?logo=visualstudiocode)](https://vscode.dev/redirect/mcp/install?name=pdfmakerapi&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40pdfmakerapi%2Fmcp%22%5D%7D)

An [MCP](https://modelcontextprotocol.io) server for **[PDFMakerAPI](https://pdfmakerapi.com)**. It
exposes a single **`create_document`** tool that turns a plain-English document description into a
**shareable link** which opens in the PDFMakerAPI editor — preview it, edit any field, and download
the PDF.

Works with **Claude Desktop, Claude.ai, Cursor, Windsurf, Cline, Zed, VS Code, ChatGPT**, and any
other MCP client. It's a thin client of the public API at `https://api.pdfmakerapi.com`, so it needs
no account or credentials of its own.

## Quick install

**One-click:**

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-000?logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=pdfmakerapi&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwZGZtYWtlcmFwaS9tY3AiXX0=) [![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?logo=visualstudiocode)](https://vscode.dev/redirect/mcp/install?name=pdfmakerapi&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40pdfmakerapi%2Fmcp%22%5D%7D)

**Or add the same config manually** (works in every desktop client):

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

## Setup by client

<details>
<summary><b>Claude Desktop</b></summary>

Settings → Developer → Edit Config (`claude_desktop_config.json`), add the `mcpServers` block above, and restart Claude.

</details>

<details>
<summary><b>Cursor</b></summary>

Use the **Add to Cursor** button, or add the block to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per-project).

</details>

<details>
<summary><b>Windsurf</b></summary>

Add the block to `~/.codeium/windsurf/mcp_config.json` (or via Settings → Cascade → MCP).

</details>

<details>
<summary><b>Cline</b></summary>

Cline → MCP Servers → Configure, and add the `mcpServers` block.

</details>

<details>
<summary><b>VS Code</b></summary>

Use the **Install in VS Code** button, or add to `.vscode/mcp.json` (note: VS Code uses a `servers` key):

```json
{
  "servers": {
    "pdfmakerapi": { "command": "npx", "args": ["-y", "@pdfmakerapi/mcp"] }
  }
}
```

</details>

<details>
<summary><b>Zed</b></summary>

In `settings.json`:

```json
{
  "context_servers": {
    "pdfmakerapi": { "command": { "path": "npx", "args": ["-y", "@pdfmakerapi/mcp"] } }
  }
}
```

</details>

## Hosted (remote) option — no install

If your client supports remote MCP servers, just point it at the hosted endpoint — no `npx`, no Node:

```
https://api.pdfmakerapi.com/mcp
```

- **Claude.ai (web):** Settings → Connectors → Add custom connector → paste the URL.
- **ChatGPT (Plus/Pro/Enterprise):** Settings → Connectors → add the URL.
- **Cursor / others:** add `{ "url": "https://api.pdfmakerapi.com/mcp" }` instead of `command`/`args`.

## Usage

Ask your assistant for a document:

> *"Make a professional invoice for Acme with 3 line items."*
> *"Create a course completion certificate."*
> *"Build a clean one-page resume."*

It calls `create_document` and returns a link like `https://app.pdfmakerapi.com/d/<id>` — open it to
preview, edit any field, and download the PDF.

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `PDFMAKERAPI_BASE_URL` | `https://api.pdfmakerapi.com` | Point at a different API (e.g. `http://localhost:3001` for local dev). |

## Develop

```bash
git clone https://github.com/GerardoBarrera/pdfmakerapi-mcp.git
cd pdfmakerapi-mcp
npm install
npm run build   # compile to dist/
npm run dev     # run from source (tsx)
```

## Troubleshooting

- **Server doesn't appear in your client** — restart the client after editing its MCP config, and check the JSON is valid (no trailing commas). For remote clients, confirm the URL is exactly `https://api.pdfmakerapi.com/mcp`.
- **`npx` fails to start** — ensure Node.js 18+ is installed (`node -v`), then retry `npx -y @pdfmakerapi/mcp@latest`.
- **Connection / timeout on the remote endpoint** — verify your network/proxy allows HTTPS to `api.pdfmakerapi.com`, and that you're using the Streamable HTTP transport.
- **"Document is too large"** — documents are capped at ~1 MB of JSON; trim large tables or split into multiple documents.
- **The returned link won't open** — copy the full link (it ends in a document ID); if it 404s, generate the document again.
- **Still stuck?** — open a [GitHub issue](https://github.com/GerardoBarrera/pdfmakerapi-mcp/issues) or email support@pdfmakerapi.com.

## License

MIT
