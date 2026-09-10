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
  assert.equal(result.structuredContent.articles.length, 6);
  assert.equal(result.structuredContent.featuredArticles, undefined);
  const tools = (await client.listTools()).tools;
  for (const name of ['show_fidelity_articles', 'plan_keeper_next_steps']) {
    assert.equal(tools.find(t => t.name === name)?._meta?.ui?.resourceUri, 'ui://fidelity-learning/article-cards.html');
  }
  for (const workflow of ['start-investing', 'savings-priorities', 'college-savings']) {
    const plan = await client.callTool({name: 'plan_keeper_next_steps', arguments: {workflow, monthlyBudget:400}});
    assert.ok(!plan.isError);
    assert.equal(plan.structuredContent.workflow, workflow);
    assert.equal(plan._meta.keeper.inputs.monthlyBudget, 400);
    assert.equal(plan.structuredContent.inputs, undefined);
  }
  const broad = await client.callTool({name:'show_fidelity_articles',arguments:{topic:'all'}});
  assert.equal(broad.structuredContent.articles.length, 6);
  const resource = await client.readResource({ uri: 'ui://fidelity-learning/article-cards.html' });
  assert.ok(resource.contents[0].text.includes('<script'));
  console.log('PASS: fresh HTTP connection, both UI tool descriptors, all three planners, capped discovery, widget metadata, bundled UI');
} finally {
  await client.close();
}
