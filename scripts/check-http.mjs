import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:8000');
const health = await fetch(new URL('/health', base), { signal: AbortSignal.timeout(10000) });
assert.equal(health.status, 200);
assert.equal((await health.json()).ok, true);
const client = new Client({ name: 'deployment-check', version: '1.0.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL('/mcp', base)));
  const result = await client.callTool({ name: 'show_fidelity_articles', arguments: { query: 'How do I save for my kids college?' } });
  assert.ok(!result.isError);
  assert.equal(result.structuredContent.resolvedTopic, 'college');
  assert.equal(result.structuredContent.featuredArticles.length, 2);
  assert.equal(result.structuredContent.additionalResources.length, 4);
  const resource = await client.readResource({ uri: 'ui://fidelity-learning/article-cards.html' });
  assert.ok(resource.contents[0].text.includes('<script'));
  console.log('PASS: health, MCP initialization, college resources, and bundled cards');
} finally {
  await client.close();
}
