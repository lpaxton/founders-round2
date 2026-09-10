# Fidelity Learning Cards MCP app

Keeper is the user experience built around this educational MCP server.

## Keeper skill

The reusable workflow lives in [skills/keeper-financial-learning/SKILL.md](skills/keeper-financial-learning/SKILL.md). It directs the host to retrieve Fidelity resources, use the two-card/four-link format, and handle follow-up planning without overstating the catalog's coverage. The skill is included in the source package and Docker image.

The chat host must install/load this skill alongside the MCP connection, for example through a plugin that bundles both. Merely running the container does not install a skill in ChatGPT. The public endpoint and an installable plugin connection still need to be configured; this repository does not yet contain a registered ChatGPT plugin.

A small MCP server that renders selected Fidelity Learning Center articles as interactive cards in OpenAI chat hosts that support MCP Apps.

This is an independent demonstration and is not affiliated with or endorsed by Fidelity. Article titles, descriptions, and outbound links come from Fidelity.com. No article images or Fidelity branding assets are copied.

## Run locally

Requirements: Node.js 24.

```bash
npm ci
npm run build
npm start
```

The MCP endpoint is `http://localhost:8000/mcp`; health status is available at `http://localhost:8000/health`.

To connect from a hosted OpenAI chat, expose the local endpoint through an HTTPS tunnel, add that `/mcp` URL as the connector, then ask: “Show me beginner investing articles from Fidelity.”

## Tool

For a local stdio MCP client, build the project and configure it to run `node server-dist/server.js --stdio` from this directory. For external clients, use the HTTPS `/mcp` endpoint described in [DEPLOYMENT.md](DEPLOYMENT.md).

The tool returns curated summaries and source URLs, not full articles or live Fidelity search. Missing coverage should be reported rather than silently replaced with web search.

`show_fidelity_articles` accepts an optional `topic` value: `all`, `investing`, `retirement`, `life-events`, or `home-buying`. It returns concise text for the model and structured article data for the widget.

## Updating the cards

Edit `src/articles.ts`, rebuild, and restart. If this becomes a production service, replace the curated data with a permitted API or an ingestion process that respects Fidelity's terms and robots policies.

## Life-event coverage

All 14 categories in Fidelity's [life-events directory](https://www.fidelity.com/learning-center/life-events/life-events-directory) have at least six curated resources, reviewed September 9, 2026:

- Changing jobs
- Planning for college
- Getting divorced
- Becoming a parent
- Caring for aging loved ones
- Marriage and partnering
- Buying or selling a house
- Preparing for and living in retirement
- Losing a loved one
- Making a major purchase
- Experiencing illness or injury
- Disabilities and special needs
- Aging well
- Becoming self-employed

Use `query` for a natural-language question, such as `{"query":"How do I start saving for my kids college?"}`. The server infers a category and returns its curated order. Set an explicit topic to override inference. The schema lists topic IDs, and results include `availableTopics`, `resolvedTopic`, and `coverage`. Unrecognized queries return `no-match` and empty resources rather than unrelated content. Broad queries without a query string can list the catalog.

Tool responses include `featuredArticles` (up to two), `additionalResources` (up to four distinct links), and the complete matching `articles` list. Resources are selected within the matching category, not a full semantic search. Coverage of all categories does not guarantee coverage of every subtopic. Summaries are concise descriptions, not full article text or live guidance. US-specific accounts, taxes, legal rules, and benefits may not apply elsewhere.

Content is stored in `src/articles.ts` and `src/life-events.ts`; routing is in `src/topics.ts`. Adding content requires source verification and a build. There is no runtime web search or crawler.

Run `npm run build` and `node --import tsx --test tests/life-events.test.ts` to verify.

## External hosting

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker, native Node hosting, HTTPS proxy configuration, and deployment verification. Production uses compiled JavaScript and does not need TypeScript tooling at runtime.
