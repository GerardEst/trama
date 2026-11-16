import type { PricingCopy } from './en'

export const pricing: PricingCopy = {
  meta: {
    title: 'Preus — Trama',
    description:
      'Trama té dos plans i cap de gratuït. Creative inclou tot l’editor per {monthly} al mes o {yearly} l’any. Pro hi afegeix les analítiques de les històries publicades.',
  },
  eyebrow: 'Preus',
  titleStart: 'Tot l’editor',
  titleEnd: 'per {price} al mes.',
  lead: 'Creative té totes les eines per escriure, provar i publicar històries interactives. Pro hi afegeix les analítiques de les històries que publiques, per a marques que necessiten saber com es juguen.',
  billing: { label: 'Període de facturació', monthly: 'Mensual', yearly: 'Anual' },
  perMonth: 'al mes',
  perYear: 'l’any',
  wasLabel: 'Dotze mensualitats:',
  nowLabel: 'pagant l’any:',
  plans: {
    creative: {
      audience: 'Per a qui escriu',
      lead: 'Totes les eines per escriure una història amb branques, provar-la i compartir-la amb un enllaç.',
      cta: 'Comença amb Creative',
      ctaNote: 'Cancel·la quan vulguis, des del teu perfil.',
      includes: 'Tot l’editor, sense res bloquejat:',
    },
    pro: {
      audience: 'Per a marques',
      lead: 'Tot el que inclou Creative i, a més, les dades: cada partida de les històries que publiques.',
      soon: 'Properament',
      ctaNote: 'Mentrestant, Creative ja inclou tot l’editor.',
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
    body: 'El motor que juga totes les històries de Trama té llicència MIT i no costa res. Fes-lo servir per jugar les teves històries en qualsevol interfície que construeixis: al teu web, en un joc o en un xat. Els plans paguen l’editor, la història que creïs és teva.',
    more: 'Com funciona',
  },
  faqTitle: 'Abans de triar.',
  faq: [
    {
      question: 'Hi ha un pla gratuït o un període de prova?',
      answer: 'No. Trama és de pagament des del primer dia: Creative costa {creativeMonthly} al mes i inclou tot l’editor. Abans de pagar pots jugar una història sencera i fer servir l’editor real a la pàgina d’inici, sense compte.',
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
      question: 'Puc pagar per anys?',
      answer: 'Sí. Creative costa {creativeYearly} l’any i Pro {proYearly} l’any, menys que dotze mensualitats. El pagament es processa amb Stripe.',
    },
    {
      question: 'Puc cancel·lar la subscripció?',
      answer: 'Sí, quan vulguis. La cancel·les tu mateix, des del teu perfil.',
    },
    {
      question: 'Quan podré contractar Pro?',
      answer: 'Aviat. Pro encara no està a la venda. Mentrestant, Creative ja inclou tot l’editor.',
    },
    {
      question: 'Trama Engine és de pagament?',
      answer: 'No. El motor és gratuït i de codi obert amb llicència MIT. El pla paga l’editor on escrius les històries, no el codi que les juga.',
    },
  ],
}
