// Copy of the pricing page. Prices are never written here: they come from lib/plans.
export const pricing = {
  meta: {
    title: 'Pricing — Trama',
    description:
      'Creative, the whole Trama editor, is free. Pro will add analytics for your published stories and is coming soon.',
  },
  eyebrow: 'Pricing',
  titleStart: 'The whole editor',
  titleEnd: 'for free.',
  lead: 'Creative has every tool to write, test and publish interactive stories, and costs nothing. Pro will add analytics for the stories you publish, for brands that need to know how they are played.',
  billing: { label: 'Billing period', monthly: 'Monthly', yearly: 'Yearly' },
  perMonth: 'a month',
  perYear: 'a year',
  wasLabel: 'Twelve monthly payments:',
  nowLabel: 'paying yearly:',
  free: 'Free',
  plans: {
    creative: {
      audience: 'For anyone who writes',
      lead: 'Every tool to write a branching story, test it and share it with a link.',
      cta: 'Start for free',
      ctaNote: 'No card and no trial period: create an account and write.',
      includes: 'The whole editor, with nothing locked:',
    },
    pro: {
      audience: 'For brands',
      lead: 'Everything in Creative, plus the numbers: every playthrough of the stories you publish.',
      soon: 'Coming soon',
      ctaNote: 'Until then, Creative already includes the whole editor, for free.',
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
    body: 'The engine that plays every Trama story is MIT-licensed and costs nothing. Use it to play your stories in any interface you build: on your own site, in a game or in a chat. Whatever your plan, the story you create is yours.',
    more: 'How it works',
  },
  faqTitle: 'Before you choose.',
  faq: [
    {
      question: 'Is Creative really free?',
      answer: 'Yes. Creative includes the whole editor and costs nothing. You do not need a card, and there is no trial period that runs out.',
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
      question: 'How much will Pro cost?',
      answer: 'Pro will cost {proMonthly} a month or {proYearly} a year, less than twelve monthly payments. Payments will be processed by Stripe.',
    },
    {
      question: 'When can I get Pro?',
      answer: 'Soon. Pro is not on sale yet. Until then, Creative already includes the whole editor, for free.',
    },
    {
      question: 'Do I pay for Trama Engine?',
      answer: 'No. The engine is free and open source under the MIT licence.',
    },
  ],
}

export type PricingCopy = typeof pricing
