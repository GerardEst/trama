// Copy of the pricing page. Prices are never written here: they come from lib/plans.
export const pricing = {
  meta: {
    title: 'Pricing — Trama',
    description:
      'Trama has two plans and no free tier. Creative includes the whole editor for {monthly} a month or {yearly} a year. Pro adds analytics for your published stories.',
  },
  eyebrow: 'Pricing',
  titleStart: 'The whole editor',
  titleEnd: 'for {price} a month.',
  lead: 'Creative has every tool to write, test and publish interactive stories. Pro adds analytics for the stories you publish, for brands that need to know how they are played.',
  billing: { label: 'Billing period', monthly: 'Monthly', yearly: 'Yearly' },
  perMonth: 'a month',
  perYear: 'a year',
  wasLabel: 'Twelve monthly payments:',
  nowLabel: 'paying yearly:',
  plans: {
    creative: {
      audience: 'For anyone who writes',
      lead: 'Every tool to write a branching story, test it and share it with a link.',
      cta: 'Start with Creative',
      ctaNote: 'Cancel whenever you want, from your profile.',
      includes: 'The whole editor, with nothing locked:',
    },
    pro: {
      audience: 'For brands',
      lead: 'Everything in Creative, plus the numbers: every playthrough of the stories you publish.',
      soon: 'Coming soon',
      ctaNote: 'Until then, Creative already includes the whole editor.',
      includes: 'Everything in Creative, and also:',
      analytics: [
        {
          title: 'Every playthrough, recorded',
          body: 'Turn on tracking for a story and each playthrough appears in a table, with the player’s name and the date.',
        },
        {
          title: 'What each reader chose',
          body: 'Each row shows the stats and conditions that playthrough ended with, so you see which paths your audience takes.',
        },
      ],
    },
  },
  sample: { caption: 'All responses', name: 'Name', date: 'Date' },
  engine: {
    eyebrow: 'Free, whatever your plan',
    title: 'Trama Engine is free and open source',
    body: 'The engine that plays every Trama story is MIT-licensed and costs nothing. Use it to play your stories in any interface you build: on your own site, in a game or in a chat. The plans pay for the editor; the story you create is yours.',
    more: 'How it works',
  },
  faqTitle: 'Before you choose.',
  faq: [
    {
      question: 'Is there a free plan or a trial?',
      answer: 'No. Trama is paid from the first day: Creative costs {creativeMonthly} a month and includes the whole editor. Before paying you can play a full story and use the real editor on the home page, without an account.',
    },
    {
      question: 'What does Pro add?',
      answer: 'Analytics for your published stories: every playthrough in a table, with the player’s name, the date and the stats and conditions it ended with. Everything else is the same as Creative.',
    },
    {
      question: 'Do my readers pay or need an account?',
      answer: 'No. Readers open the link and play, on either plan.',
    },
    {
      question: 'Can I pay yearly?',
      answer: 'Yes. Creative costs {creativeYearly} a year and Pro {proYearly} a year, less than twelve monthly payments. Payments are processed by Stripe.',
    },
    {
      question: 'Can I cancel?',
      answer: 'Yes, whenever you want. You cancel the subscription yourself, from your profile.',
    },
    {
      question: 'When can I get Pro?',
      answer: 'Soon. Pro is not on sale yet. Until then, Creative already includes the whole editor.',
    },
    {
      question: 'Do I pay for Trama Engine?',
      answer: 'No. The engine is free and open source under the MIT licence. The plan pays for the editor where you write the stories, not for the code that plays them.',
    },
  ],
}

export type PricingCopy = typeof pricing
