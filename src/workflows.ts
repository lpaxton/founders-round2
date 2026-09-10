export const workflowIds = ['start-investing', 'savings-priorities', 'college-savings'] as const;
export type WorkflowId = typeof workflowIds[number];
export const workflows = {
  'start-investing': {
    title: 'Build your investing checklist',
    description: 'Define your goal and prepare for a provider conversation.',
    steps: ['Write down your goal and when you need the money.', 'Review essential expenses, emergency savings, and debt payments.', 'Compare account purposes, eligibility, fees, and access to your money.', 'Review investment risks and diversification before choosing investments.', 'Review the provider’s current requirements before opening or funding an account.'],
    topic: 'investing'
  },
  'savings-priorities': {
    title: 'Give your monthly savings a job',
    description: 'Compare your own allocations against one shared monthly budget.',
    steps: ['List essential expenses and required debt payments before setting this budget.', 'Choose goals and target dates.', 'Review emergency savings and any employer retirement benefits.', 'Adjust allocations until they fit your budget.', 'Review your plan when income or expenses change.'],
    topic: 'home-buying'
  },
  'college-savings': {
    title: 'Plan your college contributions',
    description: 'Explore contributions for each child, then compare education savings options.',
    steps: ['Enter each child’s age and existing education savings.', 'Choose an expected college starting age and a contribution split.', 'Compare 529 plans and other education savings account types.', 'Check current state benefits, fees, eligible uses, and investment risks with the provider.', 'Review account ownership and beneficiary details before opening an account.'],
    topic: 'college'
  }
} as const;
export function collegeEstimate(age: number, startAge: number, saved: number, monthly: number) {
  if (![age, startAge, saved, monthly].every(Number.isFinite) || age < 0 || age > 100 || startAge < 0 || startAge > 100 || saved < 0 || monthly < 0) throw new Error('Enter valid nonnegative values; ages must be between 0 and 100.');
  const months = Math.max(0, Math.round((startAge - age) * 12));
  return { months, contributions: monthly * months, total: saved + monthly * months };
}
export function remainingBudget(budget: number, allocations: number[]) {
  if (![budget, ...allocations].every(x => Number.isFinite(x) && x >= 0)) throw new Error('Use nonnegative finite amounts.');
  return Math.round((budget - allocations.reduce((a, b) => a + b, 0)) * 100) / 100 || 0;
}
