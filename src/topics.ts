export const lifeEventTopics = [
  "changing-jobs", "college", "divorce", "parenting", "caregiving",
  "marriage", "home-buying", "retiring", "bereavement", "major-purchase",
  "illness-injury", "disabilities", "aging", "self-employment"
] as const;
export type LifeEventTopic = typeof lifeEventTopics[number];
export const topics = ["all", "investing", "retirement", "life-events", ...lifeEventTopics] as const;
export type Topic = typeof topics[number];
const patterns: [Topic, RegExp][] = [
  ["college", /\b(college|university|tuition|529|student loans?|education savings)\b/i],
  ["divorce", /\b(divorce|divorced|divorcing|separation|separating)\b/i],
  ["bereavement", /\b(died|death|funeral|bereavement|widow|widowed|inheritance|probate|passed away|lost my (mother|father|parent|partner|spouse))\b/i],
  ["disabilities", /\b(disability|disabilities|disabled|special needs|able account)\b/i],
  ["caregiving", /\b(caregiv\w*|elderly parents?|aging (parents?|loved ones)|care for (my |an? )?(parents?|mother|father))\b/i],
  ["parenting", /\b(baby|pregnan\w*|adopt\w*|new parents?|parenting|childcare|having (a )?child)\b/i],
  ["marriage", /\b(marriage|married|marry|wedding|partnering|newlyweds?|move in together|combine finances)\b/i],
  ["home-buying", /\b(house|home buying|buy(ing)? (a |my |our )?home|mortgage|down payment)\b/i],
  ["self-employment", /\b(self.employ\w*|freelanc\w*|business|entrepreneur|side hustle|gig work)\b/i],
  ["changing-jobs", /\b(jobs?|careers?|layoff|laid off|unemploy\w*|severance|resume)\b/i],
  ["illness-injury", /\b(illness|injur\w*|diagnos\w*|sick|medical|health care|healthcare)\b/i],
  ["aging", /\b(aging|ageing|elder|medicare|long.term care|dementia)\b/i],
  ["retiring", /\b(retir\w*|pension|social security)\b/i],
  ["major-purchase", /\b(car|vacation|holiday|travel|renovat\w*|major purchase|big purchase|appliance)\b/i],
  ["investing", /\b(invest\w*|etfs?|stocks?|bonds?|funds?)\b/i]
];
export function inferTopic(query: string): Topic | undefined {
  return patterns.find(([, pattern]) => pattern.test(query))?.[0];
}
