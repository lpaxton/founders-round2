// Optional UI check: pass a path to Playwright's index.mjs, or install Playwright.
import {build} from 'vite';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'playwright');
const output=await mkdtemp(path.join(tmpdir(),'keeper-ui-')); let browser,server;
try {
 await build({configFile:false,logLevel:'silent',plugins:[{name:'test-host',enforce:'pre',resolveId(id){if(id==='@modelcontextprotocol/ext-apps/react')return '\0host';},load(id){if(id==='\0host')return `import {useEffect} from 'react'; const app={openLink:async({url})=>{window.openedLink=url;}}; export function useApp(options){useEffect(()=>{const created={};options.onAppCreated(created);created.ontoolresult(window.fixture);},[]);return {app};}`;}}],esbuild:{jsx:'automatic'},build:{outDir:output,rollupOptions:{input:path.resolve('src/widget/index.tsx'),output:{entryFileNames:'widget.js',assetFileNames:'widget.[ext]',inlineDynamicImports:true}}}});
 server=createServer(async(req,res)=>{try{const file=req.url==='/widget.js'?'widget.js':req.url==='/widget.css'?'widget.css':null;res.setHeader('Content-Type',file?.endsWith('js')?'text/javascript':file?'text/css':'text/html');res.end(file?await readFile(path.join(output,file)):'<html><head><link rel="stylesheet" href="/widget.css"></head><body><div id="root"></div><script type="module" src="/widget.js"></script></body></html>');}catch{res.writeHead(500).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r)); browser=await chromium.launch({headless:true, ...(process.env.KEEPER_BROWSER_CHANNEL ? {channel:process.env.KEEPER_BROWSER_CHANNEL} : {})});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const article={id:'sample',title:'What is a 529 plan?',summary:'Learn about education savings.',category:'Life events',url:'https://www.fidelity.com/529-plans/what-is-a-529-plan'};
 await page.addInitScript(fixture=>{window.fixture=fixture;},{structuredContent:{mode:'planning',workflow:'college-savings',articles:[{title:article.title,summary:article.summary,url:article.url}]},_meta:{keeper:{categories:['Life events'],inputs:{monthlyBudget:400,children:[{age:8,saved:1000}]}}}});
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.getByLabel('Monthly contribution ($)').fill('200'); await page.getByText('$25,000 at the starting age',{exact:false}).waitFor();
 await page.getByLabel('Monthly contribution ($)').fill('500'); await page.getByText('$100 over your monthly budget.',{exact:false}).waitFor();
 await page.getByRole('checkbox').first().check(); await page.getByText('1 of 5 steps checked.',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Add a child'}).click(); assert.equal(await page.locator('fieldset').count(),2);
 await page.getByRole('button',{name:'Remove child 2'}).click();
 await page.getByRole('button',{name:'Read on Fidelity'}).click(); assert.equal(await page.evaluate(()=>window.openedLink),article.url);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'mobile overflow');
 console.log('PASS: mobile UI, estimates, budget warning, checklist, add/remove child, provider link');
} finally {await browser?.close();if(server)await new Promise(r=>server.close(r));await rm(output,{recursive:true,force:true});}
