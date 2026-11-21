import type { PricingCopy } from './en'

export const pricing: PricingCopy = {
  meta: {
    title: 'Preus — Trama',
    description:
      'Creative, tot l’editor de Trama, és gratuït. Pro hi afegirà les analítiques de les històries publicades i arribarà aviat.',
  },
  eyebrow: 'Preus',
  titleStart: 'Tot l’editor',
  titleEnd: 'gratis.',
  lead: 'Creative té totes les eines per escriure, provar i publicar històries interactives, i no costa res. Pro hi afegirà les analítiques de les històries que publiques, per a marques que necessiten saber com es juguen.',
  billing: { label: 'Període de facturació', monthly: 'Mensual', yearly: 'Anual' },
  perMonth: 'al mes',
  perYear: 'l’any',
  wasLabel: 'Dotze mensualitats:',
  nowLabel: 'pagant l’any:',
  free: 'Gratis',
  plans: {
    creative: {
      audience: 'Per a qui escriu',
      lead: 'Totes les eines per escriure una història amb branques, provar-la i compartir-la amb un enllaç.',
      cta: 'Comença gratis',
      ctaNote: 'Sense targeta i sense període de prova: crea un compte i escriu.',
      includes: 'Tot l’editor, sense res bloquejat:',
    },
    pro: {
      audience: 'Per a marques',
      lead: 'Tot el que inclou Creative i, a més, les dades: cada partida de les històries que publiques.',
      soon: 'Properament',
      ctaNote: 'Mentrestant, Creative ja inclou tot l’editor, gratis.',
      includes: 'Tot el que inclou Creative, i a més:',
      analytics: [
        {
          title: 'Cada partida, registrada',
          body: 'Activa el seguiment d’una història i cada partida apareix en una taula, amb el nom del jugador i la data.',
        },
        {
          title: 'Què ha triat cada lector',
          body: 'Cada fila mostra les estadístiques i les condicions amb què ha acabat la partida, i així veus quins camins tria el teu públic.',
        },
      ],
    },
  },
  sample: { caption: 'Totes les respostes', name: 'Nom', date: 'Data' },
  engine: {
    eyebrow: 'Gratuït, sigui quin sigui el pla',
    title: 'Trama Engine és gratuït i de codi obert',
    body: 'El motor que juga totes les històries de Trama té llicència MIT i no costa res. Fes-lo servir per jugar les teves històries en qualsevol interfície que construeixis: al teu web, en un joc o en un xat. Sigui quin sigui el teu pla, la història que creïs és teva.',
    more: 'Com funciona',
  },
  faqTitle: 'Abans de triar.',
  faq: [
    {
      question: 'Creative és gratis de debò?',
      answer: 'Sí. Creative inclou tot l’editor i no costa res. No necessites targeta i no hi ha cap període de prova que s’acabi.',
    },
    {
      question: 'Què hi afegeix Pro?',
      answer: 'Les analítiques de les històries publicades: cada partida en una taula, amb el nom del jugador, la data i les estadístiques i condicions amb què ha acabat. Tota la resta és igual que a Creative.',
    },
    {
      question: 'Els meus lectors han de pagar o registrar-se?',
      answer: 'No. Els lectors obren l’enllaç i juguen, amb qualsevol dels dos plans.',
    },
    {
      question: 'Quant costarà Pro?',
      answer: 'Pro costarà {proMonthly} al mes o {proYearly} l’any, menys que dotze mensualitats. El pagament es processarà amb Stripe.',
    },
    {
      question: 'Quan podré contractar Pro?',
      answer: 'Aviat. Pro encara no està a la venda. Mentrestant, Creative ja inclou tot l’editor, gratis.',
    },
    {
      question: 'Trama Engine és de pagament?',
      answer: 'No. El motor és gratuït i de codi obert amb llicència MIT.',
    },
  ],
}
