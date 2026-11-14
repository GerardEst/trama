import type { UseCasesCopy } from './en'

export const useCases: UseCasesCopy = {
  meta: {
    title: 'Casos d’ús — Trama',
    description:
      'Com fan servir Trama, l’editor sense codi d’històries interactives amb branques, els escriptors, els creadors de jocs narratius i les marques: les eines que més pesen en cada cas i el pla que hi encaixa.',
  },
  eyebrow: 'Casos d’ús',
  titleStart: 'Un mateix editor.',
  titleEnd: 'Històries molt diferents.',
  lead: 'Trama serveix per a qualsevol història on el lector decideix. Així la fan servir escriptors, creadors de jocs i marques, amb les eines que més pesen en cada cas.',
  makesLabel: 'Es fa servir per a',
  toolsTitle: 'Les eines que més hi pesen',
  planLabel: 'Pla recomanat',
  planLink: 'Mira els preus',
  cases: {
    writers: {
      name: 'Escriptors creatius',
      title: 'La teva ficció, amb més d’un camí.',
      lead: 'Per a relats, novel·les i llibrejocs on el lector decideix.',
      heading: 'Escriu com sempre. Ramifica quan vulguis.',
      body: 'Comença amb una escena i una decisió. La resta és escriure: passatges llargs amb format, un editor a pàgina completa i un tauler que mostra on porta cada camí. No has d’aprendre cap llenguatge, i Trama no escriu mai el text per tu.',
      makes: ['Ficció interactiva', 'Llibrejocs', 'Relats amb diversos finals'],
      plan: 'Tot el que necessita un escriptor és a Creative.',
    },
    games: {
      name: 'Jocs narratius',
      title: 'Lògica de joc sense programar.',
      lead: 'Per a aventures de text, misteris i RPG narratius on l’estat del jugador importa.',
      heading: 'La història porta el compte.',
      body: 'Cada decisió pot sumar a un nombre, activar una condició o desar un text. Les respostes queden bloquejades fins que el jugador té el que cal, i un distribuïdor envia cada partida per una ruta diferent segons el que ha passat abans. Tot es configura amb formularis, i el motor obert juga la mateixa història a la teva pantalla de joc.',
      makes: ['Aventures de text', 'Misteris amb pistes', 'RPG narratius'],
      plan: 'Creative inclou tota la lògica. El motor és gratuït.',
    },
    brands: {
      name: 'Marques',
      title: 'Una història que el teu públic juga.',
      lead: 'Per a campanyes, llançaments i continguts on el públic tria, i tu vols saber què ha triat.',
      heading: 'Amb el teu nom, i amb les dades.',
      body: 'Publica la història amb el teu peu i el teu enllaç en lloc dels de Trama, en una adreça fàcil de recordar. Cada final pot portar els lectors al teu web. Amb Pro veus cada partida: qui ha jugat i amb què ha acabat.',
      makes: ['Campanyes interactives', 'Històries de marca', 'Qüestionaris amb resultat'],
      plan: 'Pro afegeix les analítiques a tot el que inclou Creative.',
    },
  },
  scene: {
    reader: 'Morgan',
    ending: 'Fi',
    visit: 'Visita el nostre web',
  },
}
