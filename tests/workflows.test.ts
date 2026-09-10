import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { collegeEstimate, remainingBudget, workflowIds } from '../src/workflows.js';

test('college estimates use contributions, clamp elapsed timelines, and reject invalid values',()=>{
 assert.deepEqual(collegeEstimate(10,18,1000,200),{months:96,contributions:19200,total:20200});
 assert.deepEqual(collegeEstimate(20,18,1000,200),{months:0,contributions:0,total:1000});
 assert.equal(collegeEstimate(17.5,18,0,100).months,6);
 for(const x of [-1,NaN,Infinity]) assert.throws(()=>collegeEstimate(10,18,0,x));
});
test('allocations share one budget and expose overspending',()=>{
 assert.equal(remainingBudget(500,[200,200,100]),0);
 assert.equal(remainingBudget(500,[300,300]),-100);
 assert.equal(remainingBudget(.3,[.1,.2]),0);
 assert.throws(()=>remainingBudget(500,[-10]));
});
test('planning tool returns native UI metadata for all pilots and validates input',async()=>{
 const c = new Client({name:'keeper-planning-tests',version:'1'});
 try {
  await c.connect(new StdioClientTransport({command:process.execPath,args:['--import','tsx','src/server.ts','--stdio']}));
  const listed = await c.listTools();
  const tool = listed.tools.find(t=>t.name==='plan_keeper_next_steps');
  assert.equal((tool?._meta as any)?.ui.resourceUri,'ui://fidelity-learning/article-cards.html');
  for(const workflow of workflowIds){
   const result = await c.callTool({name:'plan_keeper_next_steps',arguments:{workflow}});
   assert.ok(!result.isError);
   const d = result.structuredContent as any;
   assert.equal(d.mode,'planning'); assert.equal(d.workflow,workflow);
   assert.ok(d.steps.length); assert.ok(d.articles.length>0&&d.articles.length<=2);
   if(workflow === "savings-priorities") assert.ok(d.articles.every((a:any)=>a.url.endsWith("/savings-plan")));
   assert.equal(d.additionalResources,undefined);
   assert.equal(d.inputs,undefined);
  }
  const result=await c.callTool({name:'plan_keeper_next_steps',arguments:{workflow:'college-savings',monthlyBudget:400,children:[{age:8,saved:1000},{age:15,saved:500}]}});
  assert.deepEqual((result._meta as any).keeper.inputs,{monthlyBudget:400,children:[{age:8,saved:1000},{age:15,saved:500}]});
  const invalid=await c.callTool({name:'plan_keeper_next_steps',arguments:{workflow:'college-savings',monthlyBudget:-1}});
  assert.ok(invalid.isError);
 } finally {await c.close();}
});
