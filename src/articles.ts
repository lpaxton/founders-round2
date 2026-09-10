import type { LifeEventTopic } from "./topics.js";
import { lifeEventArticles } from "./life-events.js";

export type Article = {
  id: string;
  title: string;
  summary: string;
  category: "Investing" | "Retirement" | "Life events";
  url: string;
  topic?: LifeEventTopic;
  reviewedAt?: string;
};

export const articles: Article[] = [
  ...lifeEventArticles,
  {
    id: "what-is-an-etf",
    title: "What is an ETF?",
    summary: "An exchange-traded fund trades on an exchange and can hold stocks, bonds, or other investments. Learn about index and actively managed ETFs, diversification, and how ETFs differ from mutual funds.",
    category: "Investing",
    url: "https://www.fidelity.com/learning-center/smart-money/what-are-etfs"
  },
  {
    id: "start-investing",
    title: "How to start investing",
    summary: "It doesn't have to be overly complicated. Here's how to start investing even as a beginner.",
    category: "Investing",
    url: "https://www.fidelity.com/viewpoints/personal-finance/how-to-start-investing"
  },
  {
    id: "traditional-or-roth",
    title: "Traditional or Roth account?",
    summary: "Get 2 tips for choosing between a Roth or traditional 401(k) or IRA.",
    category: "Retirement",
    url: "https://www.fidelity.com/viewpoints/retirement/spender-or-saver"
  },
  {
    id: "new-investor-tips",
    title: "5 tips for new investors",
    summary: "A beginner's guide to building strong investing habits.",
    category: "Investing",
    url: "https://www.fidelity.com/learning-center/smart-money/investing-tips"
  },
  {
    id: "old-401k",
    title: "Considerations for an old 401(k)",
    summary: "Explore 4 options for a 401(k) with a former employer.",
    category: "Retirement",
    url: "https://www.fidelity.com/viewpoints/retirement/what-to-do-with-an-old-401k"
  },
  {
    id: "robo-advisor",
    title: "What's a robo advisor, and how does it work?",
    summary: "Learn about automated, low-cost investing.",
    category: "Investing",
    url: "https://www.fidelity.com/learning-center/smart-money/what-is-a-robo-advisor"
  } ,
{
  "id": "save-for-house",
  "title": "How to save for a house down payment",
  "summary": "Plan your down payment target, timeline, and savings habits before buying a home.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/smart-money/how-to-save-for-a-house"
},
{
  "id": "house-down-payment",
  "title": "How much down payment do you need for a house?",
  "summary": "Understand how a down payment affects borrowing and mortgage insurance in the US.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/personal-finance/down-payment-for-a-house"
},
{
  "id": "savings-plan",
  "title": "What is a savings plan?",
  "summary": "Turn a financial goal into a savings target, timeline, and regular contributions.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/personal-finance/savings-plan"
},
{
  "id": "buy-house",
  "title": "How to buy a house",
  "summary": "Explore the US home-buying process, from financial preparation to inspections and closing.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/smart-money/how-to-buy-a-house"
},
{
  "id": "house-affordability",
  "title": "How much house can I afford?",
  "summary": "Consider income, debts, savings, and upfront costs when planning a home purchase.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/viewpoints/personal-finance/before-buying-house"
},
{
  "id": "mortgage-basics",
  "title": "What is a mortgage and how does it work?",
  "summary": "Learn the basics of financing a home purchase and the costs that affect mortgage payments.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/personal-finance/what-is-a-mortgage"
},
{
  "id": "buy-sell-house",
  "title": "How to buy and sell a house at the same time",
  "summary": "Compare the timing, costs, and tradeoffs of buying and selling homes together.",
  "category": "Life events",
  "topic": "home-buying",
  "reviewedAt": "2026-09-09",
  "url": "https://www.fidelity.com/learning-center/life-events/buying-and-selling-houses-at-the-same-time"
}
];
