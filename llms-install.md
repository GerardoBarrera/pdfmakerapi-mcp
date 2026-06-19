# Installing the PDFMakerAPI MCP server

This guide is for AI agents (e.g. Cline) setting up the PDFMakerAPI MCP server. No API key,
credentials, build step, or extra setup is required.

## What it does

One tool, `create_document`, turns a plain-English document description into a **shareable link to an
editable PDF** (invoices, certificates, reports, resumes). It returns `{ url, id }`; the user opens
the `url` to preview, edit any field, and download the PDF.

## Install (stdio — recommended)

Add this to the MCP client's config file (e.g. `cline_mcp_settings.json`,
`claude_desktop_config.json`, `~/.cursor/mcp.json`, or `.vscode/mcp.json` using a `servers` key):

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

No environment variables are required. Optionally set `PDFMAKERAPI_BASE_URL` to point at a different
API (default `https://api.pdfmakerapi.com`).

## Remote (HTTP) alternative — no install

For clients that support remote MCP servers, use the hosted endpoint instead of `npx`:

```
https://api.pdfmakerapi.com/mcp
```

## Verify

After install, the client should list a `create_document` tool. Test by asking:
*"Make a professional invoice for Acme with 3 line items."* It returns a link like
`https://app.pdfmakerapi.com/d/<id>`.
