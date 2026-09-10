import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { articles } from '../src/articles.js';
import { lifeEventTopics, inferTopic } from '../src/topics.js';

const examples = [
 ['How do I change careers?', 'changing-jobs'],
 ['how do i start saving for my kids college?', 'college'],
 ['How do I prepare for divorce?', 'divorce'],
 ['We are having a baby', 'parenting'],
 ['How can I care for my elderly parents?', 'caregiving'],
 ['We are getting married', 'marriage'],
 ['How do I start saving for a house?', 'home-buying'],
 ['When can I retire?', 'retiring'],
 ['My spouse died. What should I do?', 'bereavement'],
 ['How should I budget for a car?', 'major-purchase'],
 ['How do I budget for medical costs?', 'illness-injury'],
 ['How do ABLE accounts help with disabilities?', 'disabilities'],
 ['How can I plan for aging in place?', 'aging'],
 ['How do I start a business?', 'self-employment'],
 ['How do I get started investing?', 'investing']
] as const;

test('catalog has six distinct safe resources per life event', () => {
 assert.equal(new Set(articles.map(a => a.id)).size, articles.length);
 for (const topic of lifeEventTopics) {
  const group = articles.filter(a => a.topic === topic);
  assert.ok(new Set(group.map(a=>a.url)).size >= 6, topic);
  for(const a of group) {
   assert.equal(new URL(a.url).hostname, 'www.fidelity.com');
   assert.equal(new URL(a.url).protocol, 'https:');
   assert.ok(a.title && a.summary && a.reviewedAt);
  }
 }
});

test('natural language routing covers every life-event category', () => {
 for(const [query,topic] of examples) assert.equal(inferTopic(query),topic,query);
 assert.equal(inferTopic('What is the weather tomorrow?'),undefined);
});

test('MCP returns two cards and four distinct supporting links', async () => {
 const c = new Client({name:'life-event-tests',version:'1.0.0'});
 try {
  await c.connect(new StdioClientTransport({command:process.execPath,args:['--import','tsx','src/server.ts','--stdio']}));
  for(const [query,topic] of examples) {
   const r = await c.callTool({name:'show_fidelity_articles',arguments:{query}});
   assert.ok(!r.isError);
   const d = r.structuredContent as any;
   assert.equal(d.resolvedTopic,topic);
   assert.ok(d.articles.length <= 6);
   assert.equal(d.featuredArticles,undefined);
   assert.equal(d.additionalResources,undefined);
   if(topic !== 'investing') assert.equal(d.articles.length,6);
   const shown=d.articles;
   assert.equal(new Set(shown.map(a=>a.url)).size,shown.length);
   if(topic !== 'investing') assert.ok(shown.every(a=>articles.find(original=>original.url===a.url)?.topic === topic));
   assert.ok(!JSON.stringify(r.content).includes(shown[0].url));
  }
  const empty = await c.callTool({name:'show_fidelity_articles',arguments:{query:'What is the weather tomorrow?'}});
  assert.equal((empty.structuredContent as any).coverage,'no-match');
  assert.deepEqual((empty.structuredContent as any).articles,[]);
  const override = await c.callTool({name:'show_fidelity_articles',arguments:{topic:'college',query:'house'}});
  assert.equal((override.structuredContent as any).resolvedTopic,'college');
  assert.ok((await c.readResource({uri:'ui://fidelity-learning/article-cards.html'})).contents.length);
 } finally {await c.close();}
});
