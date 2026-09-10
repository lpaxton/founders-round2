import { useApp } from '@modelcontextprotocol/ext-apps/react';
import type { App as MccpApp } from '@modelcontextprotocol/ext-apps';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import type { Article } from '../articles.js';
import { collegeEstimate, remainingBudget, workflows, type WorkflowId } from '../workflows.js';
import './styles.css';

type ToolData = { mode?: 'planning'; workflow?: WorkflowId; articles: Article[]; inputs?: { monthlyBudget?: number; children?: {age:number;saved:number}[] } };
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
function Amount({label,value,onChange,max=100000000}: {label:string;value:string;onChange:(v:string)=>void;max?:number}) {
  return <label className="field">{label}<input type="number" min="0" max={max} step="any" value={value} onChange={e=>onChange(e.target.value)} /></label>;
}
const valid = (s: string, max=100000000) => s.trim() !== '' && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= max;
function Planner({data}: {data:ToolData}) {
  const id = data.workflow!;
  const definition = workflows[id];
  const [budget, setBudget] = useState(data.inputs?.monthlyBudget?.toString() ?? '');
  const [allocations, setAllocations] = useState(['', '', '']);
  const [children, setChildren] = useState((data.inputs?.children ?? [{age:10,saved:0}]).map(c=>({age:String(c.age),saved:String(c.saved),monthly:'',start:'18'})));
  const [checked, setChecked] = useState<number[]>([]);
  const validBudget = valid(budget,10000000);
  const validChildren = children.every(c=>valid(c.age,100)&&valid(c.start,100)&&valid(c.saved)&&valid(c.monthly));
  const collegeRemaining = validBudget && validChildren ? remainingBudget(Number(budget),children.map(c=>Number(c.monthly))) : null;
  const savingsRemaining = validBudget && allocations.every(a=>valid(a)) ? remainingBudget(Number(budget),allocations.map(Number)) : null;
  return <section className="planner">
    <h2>{definition.title}</h2><p>{definition.description}</p>
    {id !== 'start-investing' && <Amount label="Total monthly budget ($)" value={budget} onChange={setBudget} max={10000000}/>}
    {id === 'savings-priorities' && <><div className="fields">{['Emergency savings ($/month)','Long-term goals ($/month)','Near-term goals ($/month)'].map((label,i)=><Amount key={label} label={label} value={allocations[i]} onChange={v=>setAllocations(a=>a.map((old,j)=>j===i?v:old))}/>)}</div><p className="result" role="status">{savingsRemaining === null ? 'Enter your budget and all three allocations, using 0 where needed.' : savingsRemaining < 0 ? `${money(-savingsRemaining)} over your monthly budget. Adjust your allocations.` : `${money(savingsRemaining)} left to allocate each month.`}</p><p>Your entries are a budget comparison, not a recommended savings order or allocation.</p></>}
    {id === 'college-savings' && <>
      <p>Use your own figures. The starting age of 18 is editable. A default child age is illustrative when none was provided.</p>
      {children.map((c,i)=><fieldset key={i}><legend>Child {i+1}</legend><div className="fields">{(['age','start','saved','monthly'] as const).map((key)=><Amount key={key} label={{age:'Current age',start:'College starting age',saved:'Already saved ($)',monthly:'Monthly contribution ($)'}[key]} max={key==='age'||key==='start'?100:100000000} value={c[key]} onChange={v=>setChildren(list=>list.map((old,j)=>j===i?{...old,[key]:v}:old))}/>)}</div>
      {validChildren && <p className="result">{money(collegeEstimate(Number(c.age),Number(c.start),Number(c.saved),Number(c.monthly)).total)} at the starting age · {collegeEstimate(Number(c.age),Number(c.start),Number(c.saved),Number(c.monthly)).months} months of contributions</p>}
      {Number(c.start)<=Number(c.age) && <p>No time before the selected starting age; this estimate includes existing savings only.</p>}
      {children.length>1 && <button onClick={()=>setChildren(list=>list.filter((_,j)=>j!==i))}>Remove child {i+1}</button>}</fieldset>)}
      <button disabled={children.length>=10} onClick={()=>setChildren(c=>[...c,{age:'',start:'18',saved:'0',monthly:''}])}>Add a child</button>
      <p className="result" role="status">{collegeRemaining === null ? 'Enter valid nonnegative amounts for every child and your total budget.' : collegeRemaining < 0 ? `${money(-collegeRemaining)} over your monthly budget. Adjust the contribution split.` : `${money(collegeRemaining)} left in your monthly budget.`}</p>
      <p>Keeper estimate: existing savings + monthly contributions × months until the starting age. Assumes constant monthly contributions, with no growth, inflation, fees, or taxes. This does not estimate college costs or whether your savings will be enough.</p>
    </>}
    <h3>Your next steps</h3><div className="checklist">{definition.steps.map((step,i)=><label key={step}><input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(c=>c.includes(i)?c.filter(n=>n!==i):[...c,i])}/><span>{step}</span></label>)}</div>
    <p>{checked.length} of {definition.steps.length} steps checked. Progress and edits stay in this view; they are not saved or sent back to the conversation.</p>
  </section>;
}
function Widget() {
  const [data,setData] = useState<ToolData|null>(null);
  const [revision,setRevision] = useState(0);
  const [linkError,setLinkError] = useState('');
  const {app,error} = useApp({appInfo:{name:'Keeper',version:'0.2.0'},capabilities:{},onAppCreated:(created:MccpApp)=>{
    created.ontoolresult=result=>{setData(result.structuredContent as ToolData);setRevision(r=>r+1);setLinkError('');};
  }});
  if(error) return <div className="status error">Keeper could not load. Ask for linked resources instead.</div>;
  if(!app||!data) return <div className="status">Loading Keeper…</div>;
  const planning = data.mode === 'planning' && data.workflow && data.workflow in workflows;
  const open = async(url:string)=>{try{await app.openLink({url});}catch{setLinkError('The link could not open. Please try again.');}};
  return <main><header><div><p className="eyebrow">KEEPER</p><h1>{planning?'Turn learning into next steps':'Explore your financial next steps'}</h1><p className="intro">Content from Fidelity Investments</p></div><span className="mark" aria-hidden="true">↗</span></header>
    {planning && <Planner key={revision} data={data}/>}
    <section aria-label="Fidelity learning resources"><h2>{planning?'Explore the account and planning details':'Articles to help you get started'}</h2>
    {!data.articles.length && <p>No matching resources are available in Keeper’s curated catalog.</p>}
    <div className="grid">{data.articles.slice(0,2).map((article,index)=><article key={article.id}><div className={`art art-${index%3}`}><span>{article.category}</span></div><div className="copy"><h2>{article.title}</h2><p>{article.summary}</p><button className="read" onClick={()=>void open(article.url)}>Read on Fidelity →</button></div></article>)}</div>
    {!planning && data.articles.length>2 && <details><summary>Here are some additional resources</summary><ul>{data.articles.slice(2,6).map(a=><li key={a.id}><button className="read" onClick={()=>void open(a.url)}>{a.title}</button></li>)}</ul></details>}
    </section>{linkError&&<p role="alert">{linkError}</p>}
    <footer>Independent Keeper demo · US-focused educational resources. Planning tools are from Keeper. Links open Fidelity education pages; no account is opened and no money is moved.</footer></main>;
}
createRoot(document.getElementById('root')!).render(<Widget/>);
