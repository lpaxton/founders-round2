import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { App as McpApp } from "@modelcontextprotocol/ext-apps";
import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import type { Article } from "../articles.js";
import "./styles.css";

type ToolData = { articles: Article[]; sourceUrl: string; updatedAt: string };
type Filter = "All" | Article["category"];

function Widget() {
  const [data, setData] = useState<ToolData | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const { app, error } = useApp({
    appInfo: { name: "Learning Center Cards", version: "0.1.0" },
    capabilities: {},
    onAppCreated: (created: McpApp) => {
      created.ontoolresult = (result) => setData(result.structuredContent as ToolData);
    }
  });

  const visible = useMemo(
    () => data?.articles.filter((article) => filter === "All" || article.category === filter) ?? [],
    [data, filter]
  );

  if (error) return <div className="status error">Unable to load the cards.</div>;
  if (!app || !data) return <div className="status">Loading learning articles…</div>;

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">LEARNING CENTER</p>
          <h1>Explore your financial next steps</h1>
          <p className="intro">Content from Fidelity Investments</p>
        </div>
        <span className="mark" aria-hidden="true">↗</span>
      </header>

      <nav aria-label="Filter articles">
        {(["All", "Investing", "Retirement", "Life events"] as Filter[]).map((value) => (
          <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>
        ))}
      </nav>

      <section className="grid">
        {visible.slice(0, 2).map((article, index) => (
          <article key={article.id}>
            <div className={`art art-${index % 3}`}><span>{article.category}</span></div>
            <div className="copy">
              <p className="category">{article.category}</p>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
              <button className="read" onClick={() => app.openLink({ url: article.url })}>Read on Fidelity <span>→</span></button>
            </div>
          </article>
        ))}
      </section>

      {visible.length > 2 && <section aria-label="Additional resources">
        <h2>Here are some additional resources:</h2>
        <ul>{visible.slice(2, 6).map((article) => <li key={article.id}>
          <button className="read" onClick={() => app.openLink({ url: article.url })}>{article.title}</button>
        </li>)}</ul>
      </section>}

      <footer>Independent demo · Content and links from Fidelity.com · Educational content is not investment advice.</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Widget />);
