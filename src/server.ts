import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { articles } from "./articles.js";
import { topics, lifeEventTopics, inferTopic } from "./topics.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIDGET_URI = "ui://fidelity-learning/article-cards.html";
const SOURCE_URL = "https://www.fidelity.com/learning-center/overview";

function createServer() {
  const server = new McpServer({ name: "fidelity-learning-cards", version: "0.1.0" }, {
    instructions: "Use show_fidelity_articles for investing, retirement, and life-event education, including college, parenting, marriage, divorce, caregiving, aging, illness, disability, bereavement, jobs, self-employment, major purchases, home buying, and retiring. This is a curated Fidelity article catalog, not live search or full article retrieval. Base answers only on returned summaries and cite their URLs. Report missing coverage instead of silently using web search."
  });

  registerAppTool(server, "show_fidelity_articles", {
    title: "Show Fidelity learning articles",
    description: "Retrieve curated Fidelity Learning Center article summaries and display cards. Use first for investing questions including ETFs, stocks, bonds, funds, retirement, life events, saving for a house, down payments, and mortgages. Pass the user question as query to select a relevant category, or choose a topic explicitly. Covers all 14 Fidelity life-event categories, including college and 529 plans. Does not search the web or retrieve full articles; the catalog may not cover the requested subject.",
    inputSchema: {
      topic: z.enum(topics).default("all").describe("Optional topic filter"),
      query: z.string().trim().min(1).max(500).optional().describe("The user question, used to infer a topic when topic is all or life-events")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    _meta: { ui: { resourceUri: WIDGET_URI } }
  }, async ({ topic, query }) => {
    const inferred = query ? inferTopic(query) : undefined;
    const resolvedTopic = query && (topic === "all" || topic === "life-events") ? inferred : topic;
    const selected = resolvedTopic === undefined ? [] : articles.filter((article) => {
      if (resolvedTopic === "all") return true;
      if (resolvedTopic === "life-events") return article.category === "Life events";
      if (resolvedTopic === "retirement") return article.category === "Retirement" || article.topic === "retiring";
      return article.topic === resolvedTopic || article.category.toLowerCase() === resolvedTopic;
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ source: "Curated Fidelity Learning Center catalog (not live retrieval)", resolvedTopic, coverage: selected.length ? "available" : "no-match", articles: selected, featuredArticles: selected.slice(0, 2), additionalResources: selected.slice(2, 6) }) }],
      structuredContent: { resolvedTopic, availableTopics: lifeEventTopics, coverage: selected.length ? "available" : "no-match", articles: selected, featuredArticles: selected.slice(0, 2), additionalResources: selected.slice(2, 6), sourceUrl: SOURCE_URL, updatedAt: new Date().toISOString() }
    };
  });

  registerAppResource(server, "Fidelity learning article cards", WIDGET_URI, {
    mimeType: RESOURCE_MIME_TYPE,
    description: "Interactive article cards with category filters and links to Fidelity.com"
  }, async () => ({
    contents: [{
      uri: WIDGET_URI,
      mimeType: RESOURCE_MIME_TYPE,
      text: fs.readFileSync(path.join(ROOT, "dist/article-cards.html"), "utf8"),
      _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] } } }
    }]
  }));
  return server;
}

if (process.argv.includes("--stdio")) {
  await createServer().connect(new StdioServerTransport());
} else {
const port = Number(process.env.PORT ?? "8000");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer between 1 and 65535");
fs.accessSync(path.join(ROOT, "dist/article-cards.html"));
const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, server: "fidelity-learning-cards" }));
app.all("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { void transport.close(); void server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
  }
});
const listener = app.listen(port, "0.0.0.0", () => console.log(`Fidelity Learning MCP server listening on port ${port}`));
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    listener.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
}
