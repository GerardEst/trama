import type { Dictionary } from '../i18n.types'

export const landing: Dictionary['landing'] = {
  meta: {
    title: 'Trama — Tu escrius la història. Ells trien el camí.',
    description:
      'Tu escrius la història. Ells trien el camí. Crea històries interactives en un llenç visual, comparteix-les amb un sol enllaç i descobreix cap on van els teus lectors.',
  },
  nav: {
    label: 'Navegació principal',
    home: 'Inici de Trama',
    skip: 'Salta al contingut',
    features: 'Funcions',
    pricing: 'Preus',
    docs: 'Documentació',
    login: 'Inicia sessió',
    dashboard: 'Panell',
    start: 'Comença gratis',
  },
  hero: {
    eyebrow: 'UNA LLAR PER A HISTÒRIES INTERACTIVES',
    titleStart: 'Tu escrius la història.',
    titleEnd: 'Els lectors trien el camí.',
    description:
      'Construeix un món narratiu i interactiu. Comparteix la teva història amb un sol enllaç i deixa que els lectors explorin el mon que has creat.',
    openDashboard: 'Obre el teu panell',
    startStory: 'Comença la teva història',
    tryStory: 'Prova una història',
    free: '✓ Gratis per començar',
    noCard: '✓ Sense targeta de crèdit',
    noAccount: '✓ Els lectors no necessiten compte',
    demoLabel: 'Juga a El darrer llindar',
  },
  demo: {
    heading: 'UNA HISTÒRIA REAL. EL TEU PROPER MOVIMENT.',
    titleStart: 'EL DARRER',
    titleEnd: 'LLINDAR',
    endingStart: 'Aquest final era teu.',
    endingEnd: 'Ara escriu el començament d’algú altre.',
    makeAnother: 'Crea una altra història',
    createFirst: 'Crea la teva primera història gratis',
    ended: 'Cada decisió porta a un altre lloc.',
    intro: 'Sense registre. Tria un camí.',
    restart: 'Torna a començar',
  },
  features: {
    eyebrow: 'MÉS ENLLÀ DE LES BRANQUES',
    titleStart: 'Històries que',
    titleEnd: 'recorden.',
    description:
      'Decisions que importen, camins que s’adapten i un tauler que continua sent llegible a mesura que el teu món creix. Tot sense escriure ni una línia de codi.',
    readGuide: 'Consulta la documentació',
    events: {
      label: 'ESDEVENIMENTS',
      title: 'Decisions amb conseqüències',
      description:
        'Porta el compte de monedes, descobertes, confiança i tot el que la teva història hagi de recordar. Cada escena i cada resposta poden canviar l’estat del jugador, sense codi.',
      link: 'Descobreix com funcionen els esdeveniments',
    },
    distributors: {
      label: 'DISTRIBUÏDORS',
      title: 'Camins que depenen del jugador',
      description:
        'Dirigeix els lectors segons el que han fet. Guanya la primera ruta que es compleix, i la resta passa a «En cas contrari».',
      link: 'Coneix els nodes distribuïdors',
    },
    playerInput: {
      label: 'TEXT DEL JUGADOR',
      title: 'Les paraules del lector, a la teva història',
      description:
        'Demana un nom o una idea i entrellaça’l en passatges posteriors amb una variable.',
      link: 'Pregunta al jugador',
    },
    requirements: {
      label: 'REQUISITS',
      title: 'Respostes que cal guanyar-se',
      description:
        'Una clau trobada obre la porta. Prou monedes compren el mapa. Les respostes només apareixen quan el jugador compleix tots els requisits.',
      link: 'Afegeix requisits',
    },
    focusMode: {
      label: 'MODE CONCENTRACIÓ',
      title: 'Espai per escriure',
      description:
        'Surt del llenç cap a un editor sense distraccions per a passatges llargs, amb títols, llistes i variables. Tanca’l i tornes al mateix mapa.',
      link: 'Prova el mode concentració',
    },
    organisation: {
      label: 'GRUPS I MARCS',
      title: 'Històries grans, encara llegibles',
      description:
        'Plega un capítol en un grup o mantén-lo visible dins d’un marc mòbil.',
      link: 'Organitza el teu tauler',
    },
  },
  visuals: {
    distributor: 'Distribuïdor',
    secretRule: 'confiança > 2 I te_clau',
    secretEntrance: 'Entrada secreta',
    frontRule: 'confiança > 2',
    frontEntrance: 'Entrada principal',
    otherwise: 'En cas contrari',
    gatekeeper: 'Guardià',
    askName: 'Com vols que et diguem?',
    welcomeBack: 'Hola de nou,',
    nameToken: '#nom',
    coins: 'monedes 2',
    hasKey: 'te_clau ✓',
    openArchive: 'Obrir l’arxiu',
    requiresKey: 'requereix te_clau',
    buyMap: 'Comprar el mapa',
    requiresCoins: 'requereix 3 monedes',
    walkAway: 'Marxar',
    close: 'Tanca',
    chapterHeading: 'Capítol 2 · L’arxiu',
    passageStart:
      'La porta va cedir amb un sospir, com si hagués estat esperant',
    passageEnd:
      'des de sempre. La pols surava a la llum del fanal i es posava en prestatges que s’endinsaven més del que l’edifici hauria de permetre.',
    chapter2: 'Capítol 2',
    chapter3: 'Capítol 3',
    scenes: '6 escenes',
  },
  pricing: {
    titleStart: 'Comença gratis.',
    titleEnd: 'Creix a partir d’aquí.',
    description: 'Més espai quan el necessitis.',
    license: {
      audience: 'PER A PROFESSIONALS',
      badge: 'Aviat',
      title: 'Llicència d’exportació',
      preview: 'Llicència proposada. Encara no es pot comprar.',
      frequencyStart: 'Un únic pagament.',
      frequencyEnd: 'Sense subscripció.',
      description:
        'Totes les eines de creació. Exportacions il·limitades. Allotja, distribueix o ven les teves històries en els teus propis termes.',
      ownership: 'La teva plataforma. Els teus ingressos. Sense royalties.',
      limit:
        'Només exportació. Sense jocs allotjats a Trama, enllaços per compartir ni analítiques de jugadors.',
      ask: 'Pregunta per la llicència',
      subject: 'Consulta sobre la llicència d’exportació',
    },
  },
  questions: {
    title: 'Alguns caps per lligar.',
    free: {
      question: 'Puc començar gratis?',
      answer:
        'Sí. El pla Basic és gratuït, així que pots crear i compartir les teves primeres històries abans de decidir si necessites més espai.',
    },
    readers: {
      question: 'Els lectors necessiten un compte?',
      answer:
        'No. Comparteix un enllaç i els lectors poden entrar directament a la teva història sense registrar-se ni instal·lar res.',
    },
    export: {
      question: 'Puc exportar o allotjar les meves històries pel meu compte?',
      answer:
        'Les històries viuen a Trama i es comparteixen amb un enllaç. Per als estudis i autors que les vulguin allotjar o vendre a la seva pròpia plataforma, estem preparant una llicència d’exportació de pagament únic.',
    },
    create: {
      question: 'Què puc crear amb Trama?',
      answer:
        'Ficció interactiva, aventures amb branques, qüestionaris i altres experiències de «tria el teu propi camí». Comença amb una escena i descobreix on et porta.',
    },
  },
  closing: {
    label: 'LA TEVA PRÒXIMA AVENTURA',
    titleStart: 'Què passa',
    titleEnd: 'després?',
    yours: 'Aquesta part l’escrius tu.',
  },
  footer: {
    tagline: 'Les històries no han d’anar per força en línia recta.',
    guide: 'Documentació',
    pricing: 'Preus',
    login: 'Inicia sessió',
    email: 'Escriu al creador',
    rights: '© trama.app · Tots els drets reservats',
  },
}
