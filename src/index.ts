#!/usr/bin/env node
// MCP server for PDFMakerAPI. Exposes a single `create_document` tool that
// turns a Document (designed by the calling model) into a shareable link that
// opens in the PDFMakerAPI editor — preview, edit any field, download the PDF.
//
// Transport: stdio (Claude Desktop, Cursor, Windsurf, Cline, etc.).
// It is a thin client of the public API at PDFMAKERAPI_BASE_URL, so it needs
// no server or credentials of its own.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.PDFMAKERAPI_BASE_URL ?? "https://api.pdfmakerapi.com";

// Kept in sync with gpt/instructions.md and apps/api/src/jarvis/prompts.ts.
const DOCUMENT_GUIDE = `
Design a THOROUGH, realistic document (don't leave it sparse) that exactly follows this model, then pass it as \`document\`.

DOCUMENT MODEL (PDFMakerAPI)
Document:
- id: string (short slug)
- name: string
- description: string (one short sentence)
- pageSize: "letter" | "a4" | "legal" | "letter-landscape" | "a4-landscape" | "square" (default "a4")
- pageBackgroundColor: hex string (default "#ffffff")
- margin: "none" | "sm" | "md" | "lg" — page margin; default "lg"
- gap: "none" | "sm" | "md" | "lg" — vertical spacing between top-level sections; default "lg"
- variables: Variable[] — every {{placeholder}} you use MUST be declared here
- children: Node[] — the document body, top to bottom

Variable: { id, name (snake_case, used as {{name}}), label (human), type: "text"|"date"|"number"|"currency", defaultValue?: string }

Node (every node has: id, name, width: "full"|"1/2"|"1/3"|"1/4"|"2/3"|"3/4"|"auto", order: number, align?: "left"|"center"|"right", style?: NodeStyle):
- container: { type:"container", layout:{ direction:"row"|"column", gap:"none"|"sm"|"md"|"lg", justify?:"start"|"center"|"end"|"between", alignItems?:"start"|"center"|"end"|"stretch" }, children: Node[] }
- text: { type:"text", content: string (supports \\n and {{vars}}), fontSize?:"xs"|"sm"|"base"|"lg"|"xl", fontWeight?:"normal"|"medium"|"semibold"|"bold" }
- table: { type:"table", columns: { id, name (data key), label (header), width?: "40%", align?: "left"|"center"|"right" }[], rowVariable: string }
- spacer: { type:"spacer", height: "sm"|"md"|"lg"|"xl" }
- divider: { type:"divider", lineStyle?: "solid"|"dashed"|"dotted" }

NodeStyle: { backgroundColor?: hex, backgroundMode?: "none"|"solid"|"gradient", gradientTo?: hex, textColor?: hex, padding?: "none"|"sm"|"md"|"lg"|"xl", borderRadius?: "none"|"sm"|"md"|"lg", fullBleed?: boolean }

VARIABLES — how data is inserted
- In text content, insert a value with double braces and the exact snake_case name, e.g. {{invoice_number}} — no spaces inside the braces. Every {{name}} used MUST be declared in variables[].
- Give every variable a realistic defaultValue so the result looks complete.
- TABLES do NOT use {{}}. A table renders one row per item in its rowVariable array, pulling item[column.name] for each cell — so each column "name" must match the row object's key. The rowVariable variable's defaultValue must be a JSON-encoded string of the row array, e.g. JSON.stringify([{ description: "Brand design", qty: "1", amount: "$2,400.00" }]).

RULES
- Use containers (direction:"row") to place items side by side.
- For label/value pairs (dates, totals, "Bill To", reference numbers), nest a direction:"row" container with two text children — a BOLD label (fontWeight:"bold") and the value as a {{variable}} — each with a width (e.g. label "1/3", value "2/3") so they align in columns. Stack such rows in a column container.
- Use a table node for any repeating rows (line items, attendees) and set rowVariable.
- Spacing between sections comes from the document "gap" (default "lg") — do NOT insert spacer nodes between top-level sections.
- Table column alignment: left-align text columns, right-align money/number columns, center short codes/status; a header's alignment matches its column.
- Every id must be unique. Keep it clean and professional.

After the tool returns a url, share it with the user and tell them they can open it to preview, edit any field, and download the PDF.
`;

const ICONS = [
  {
    src: "https://pdfmakerapi.com/icon-512.png",
    mimeType: "image/png",
    sizes: ["512x512"],
  },
];

const server = new McpServer({
  name: "pdfmakerapi",
  version: "1.0.0",
  title: "PDFMakerAPI",
  websiteUrl: "https://pdfmakerapi.com",
  icons: ICONS,
});

server.registerTool(
  "create_document",
  {
    title: "Create PDF Document",
    description: `Create a professional, shareable PDF document — invoices, receipts, certificates, reports, resumes, letters, and more. Returns a link that opens the document in the PDFMakerAPI editor, where the user can preview it, edit any field, and download the PDF.\n${DOCUMENT_GUIDE}`,
    inputSchema: {
      document: z
        .object({
          id: z.string().optional(),
          name: z.string().optional().describe("Document name."),
          description: z.string().optional(),
          pageSize: z
            .string()
            .optional()
            .describe('"letter" | "a4" | "legal" | "letter-landscape" | "a4-landscape" | "square" (default "a4").'),
          pageBackgroundColor: z.string().optional().describe("Hex color, e.g. #ffffff."),
          margin: z.string().optional().describe('"none" | "sm" | "md" | "lg" (default "lg").'),
          gap: z.string().optional().describe('"none" | "sm" | "md" | "lg" (default "lg").'),
          variables: z
            .array(z.record(z.string(), z.any()))
            .optional()
            .describe("Declared variables; every {{name}} used in content MUST be declared here."),
          children: z
            .array(z.record(z.string(), z.any()))
            .optional()
            .describe("The document body — an ordered array of nodes (container/text/table/spacer/divider). See the DOCUMENT MODEL above."),
        })
        .describe("The PDFMakerAPI Document to create. Follow the DOCUMENT MODEL in this tool's description."),
    },
    outputSchema: {
      url: z
        .string()
        .describe(
          "Shareable link that opens the document in the PDFMakerAPI editor to preview, edit, and download the PDF.",
        ),
      id: z.string().describe("The stored document id."),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ document }) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "pdfmakerapi-mcp" },
        body: JSON.stringify({ document }),
      });
      if (!res.ok) {
        const detail = await res.text();
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to create the document (HTTP ${res.status}). ${detail}`,
            },
          ],
        };
      }
      const data = (await res.json()) as { id: string; url: string };
      return {
        content: [
          {
            type: "text",
            text: `Document created. Open this link to preview, edit any field, and download the PDF:\n${data.url}`,
          },
        ],
        structuredContent: { url: data.url, id: data.id },
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error contacting PDFMakerAPI: ${(err as Error).message}`,
          },
        ],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
// Note: stdout is reserved for the MCP protocol — never console.log here.
console.error("pdfmakerapi-mcp server running on stdio");
