import type { Dictionary } from '../i18n.types'

export const landing: Dictionary['landing'] = {
  meta: {
    title: 'Trama — Tu escrius la història. Ells trien el camí.',
    description:
      'Escriu ficció interactiva sense programar. Connecta escenes i decisions, prova’n les conseqüències, corregeix mentre jugues i comparteix la història amb un enllaç.',
  },
  nav: {
    label: 'Navegació principal',
    home: 'Inici de Trama',
    skip: 'Salta al contingut',
    authoring: 'Com funciona',
    features: 'Funcions',
    pricing: 'Preus',
    docs: 'Documentació',
    login: 'Inicia sessió',
    dashboard: 'Panell',
    start: 'Tria Creator',
  },
  hero: {
    eyebrow: 'PER A AUTORS DE FICCIÓ INTERACTIVA',
    titleStart: 'Tu escrius la història.',
    titleEnd: 'Els lectors trien el camí.',
    description:
      'Escriu escenes, connecta decisions i prova com canvia la història amb cada camí. Corregeix els passatges mentre la recorres i comparteix-la amb un enllaç. Sense programar.',
    openDashboard: 'Obre el teu panell',
    startStory: 'Crea la teva primera història',
    tryStory: 'Juga una història',
    free: '✓ Totes les funcions de l’editor incloses',
    noCard: '✓ Facturació mensual o anual',
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
    createFirst: 'Crea la teva primera història',
    ended: 'Cada decisió porta a un altre lloc.',
    intro: 'Sense registre. Tria un camí.',
    restart: 'Torna a començar',
  },
  demoBridge: {
    description: 'Alliberar l’esperit o agafar el segell lunar canvia què pots fer més endavant. Tu decideixes quines decisions recorda la teva història.',
    action: 'Mira com es construeix',
  },
  authoring: {
    eyebrow: 'LA TEVA HISTÒRIA, PAS A PAS',
    title: 'De la primera escena a una història per compartir.',
    description: 'Escriu els passatges. Dona forma als camins al mapa. Recorre’ls i corregeix sobre la marxa, sense sortir de la teva història.',
    enlarge: 'Obre la captura de l’editor a mida completa (pestanya nova)',
    realCapture: 'Editor real · Història d’exemple',
    write: {
      title: 'Escriu',
      description: 'Dona espai als passatges llargs a l’editor de text.',
      caption: 'Edita passatges i respostes al panell de lectura. Crea escenes noves i connexions al mapa.',
      alt: 'L’editor de Trama amb el mapa de la història al costat d’un passatge editable i les seves respostes.',
    },
    map: {
      title: 'Connecta',
      description: 'Enllaça decisions amb escenes i organitza els camins al mapa.',
      caption: 'El tauler mostra les escenes, les respostes i les connexions entre elles.',
      alt: 'El tauler de Trama amb escenes connectades i dos camins diferents en una història d’exemple.',
    },
    preview: {
      title: 'Prova i corregeix',
      description: 'Segueix un camí, torna enrere i passa a editar quan un passatge ho necessiti.',
      caption: 'La previsualització recorre la història al costat del mapa. Passa a Edita per corregir el passatge actual.',
      alt: 'La previsualització de lectura de Trama al costat del mapa, amb decisions i botons per tornar enrere i editar.',
    },
    share: {
      title: 'Comparteix',
      description: 'Envia un enllaç directe als lectors. No necessiten compte.',
      caption: 'Copia l’enllaç de la història des de la finestra de compartir i envia’l als teus lectors.',
      alt: 'La finestra de compartir de Trama amb l’enllaç d’una història i el botó per copiar-lo.',
    },
  },
  trust: {
    eyebrow: 'CREADA PER TU',
    title: 'Tu poses la veu. Trama posa les eines.',
    description: 'Les paraules, els personatges i les decisions els escrius tu. Trama no genera el text per tu.',
    saving: {
      title: 'Saps quan s’ha desat',
      description: 'Els canvis es desen automàticament. Si un desat falla, l’editor mostra un avís i et permet tornar-ho a provar.',
    },
    history: {
      title: 'Pots canviar d’idea',
      description: 'Desfés i refés canvis recents mentre treballes. L’historial de la sessió no és un arxiu permanent de versions.',
    },
    data: {
      title: 'Descarrega les dades de la història',
      description: 'Descarrega un JSON des de les opcions de la història. Conté el text, l’estructura i la configuració, no un joc independent ni les imatges empaquetades.',
    },
  },
  features: {
    eyebrow: 'MÉS ENLLÀ DE LES BRANQUES',
    titleStart: 'Històries que',
    titleEnd: 'recorden.',
    description:
      'Una promesa complerta, una clau trobada, una amistat guanyada. Fes que les decisions anteriors canviïn el que passa després, sense escriure codi.',
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
      title: 'El passat canvia el que passa després',
      description:
        'Un aliat que confia en el lector el deixa entrar. Un desconegut ha de trobar una altra entrada. Defineix rutes diferents segons el que ha fet el lector.',
      link: 'Coneix els nodes distribuïdors',
    },
    playerInput: {
      label: 'TEXT DEL JUGADOR',
      title: 'Fes lloc al lector dins de la història',
      description:
        'Demana un nom o una idea i entrellaça’l en passatges posteriors amb una variable.',
      link: 'Pregunta al jugador',
    },
    requirements: {
      label: 'REQUISITS',
      title: 'No totes les opcions s’obren des del principi',
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
      title: 'Dona un lloc a cada capítol',
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
    titleStart: 'Crea amb Creator.',
    titleEnd: 'Pro vindrà després.',
    description: 'Creator inclou totes les funcions actuals de l’editor. El selector de facturació només s’aplica a Creator. Pro serà de pagament únic i encara no està a la venda.',
  },
  questions: {
    title: 'Alguns caps per lligar.',
    code: {
      question: 'He de saber programar?',
      answer: 'No. Escriu passatges a l’editor de text, connecta escenes al tauler i configura esdeveniments i requisits visualment. La documentació explica les eines amb exemples.',
    },
    free: {
      question: 'Quins plans estan disponibles?',
      answer: 'Creator està disponible amb facturació mensual o anual i totes les funcions actuals de l’editor incloses. Pro està previst com un pagament únic d’uns 200 € amb exportació d’històries, però encara no està disponible. El preu, el format i l’abast de l’exportació no són definitius.',
    },
    readers: {
      question: 'Els lectors necessiten un compte?',
      answer: 'No. Comparteix un enllaç i els lectors poden entrar directament a la teva història sense registrar-se ni instal·lar res.',
    },
    download: {
      question: 'Puc descarregar les dades de la història?',
      answer: 'Sí. Obre les opcions de la història al panell i tria Exporta JSON. El fitxer inclou el text, l’estructura i la configuració. Les imatges continuen sent referències externes; no s’empaqueten. Encara no hi ha una eina d’importació o restauració per a l’usuari.',
    },
    export: {
      question: 'Puc allotjar una història jugable al meu web?',
      answer: 'Encara no. Avui els lectors juguen amb un enllaç de Trama. La descàrrega JSON conté dades de la història, no un joc HTML independent. L’exportació jugable està prevista per a Pro, però el format, l’abast i la data de llançament encara s’han de decidir.',
    },
    cancel: {
      question: 'Què passa si cancel·lo Creator?',
      answer: 'Pots sol·licitar la cancel·lació des del teu compte. Descarrega les dades de la història en JSON abans de canviar de pla. Si necessites confirmar la data efectiva de cancel·lació o l’accés a les històries i els enllaços, escriu-nos abans de cancel·lar. Pro és una proposta futura separada, no una migració automàtica.',
      contact: 'Consulta la teva subscripció',
    },
    create: {
      question: 'Què puc crear amb Trama?',
      answer: 'Ficció interactiva i aventures amb branques i conseqüències. Comença amb una escena, ofereix una decisió al lector i tria què recorda la història.',
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
