import type { GuideGroup } from './feature-guide.content'

// Mirrors FEATURE_GUIDE chapter by chapter; ids stay in English so links are shared.
export const FEATURE_GUIDE_CA: readonly GuideGroup[] = [
  {
    title: 'Fes que reaccioni',
    description:
      'Dona conseqüències a les decisions i fes que la història les recordi.',
    features: [
      {
        id: 'events',
        title: 'Esdeveniments a escenes i decisions',
        summary:
          'Canvia l’estat del jugador quan arriba a un node o tria una resposta. Porta el compte de monedes, descobertes, confiança i altres conseqüències sense escriure codi.',
        steps: [
          'Tria Afegeix un esdeveniment en un node per actuar quan el jugador hi arribi, o en una resposta per actuar quan la triï.',
          'Tria una estadística numèrica, una condició vertadera/falsa o una propietat de text. Posa nom a la referència per poder-la reutilitzar en altres llocs.',
          'Defineix el canvi: suma o resta un nombre, activa o desactiva una condició, o assigna un valor a una propietat.',
        ],
        example: {
          label: 'Una decisió amb conseqüències',
          lines: [
            'Ajudar el desconegut → confiança +1',
            'Agafar la clau → te_clau passa a ser vertadera',
          ],
        },
        note: 'Els esdeveniments d’un node s’executen a cada arribada, també a les visites repetides. Els esdeveniments d’una resposta s’executen abans que la història passi al node següent.',
      },
      {
        id: 'conditional-paths',
        title: 'Camins que depenen del jugador',
        summary:
          'El mateix punt de decisió pot portar a escenes diferents segons el que hagi fet el jugador. Un visitant de confiança i un de desconegut no han de rebre per força la mateixa benvinguda.',
        steps: [
          'Fes servir esdeveniments per registrar una estadística numèrica o una condició vertadera/falsa durant la història.',
          'Connecta el camí a un node distribuïdor que comprovi aquestes referències.',
          'Connecta cada ruta que es compleixi amb la seva escena i afegeix una destinació En cas contrari per a la resta.',
        ],
        example: {
          label: 'Una entrada, dues experiències',
          lines: [
            'te_clau és vertadera → entrar a l’arxiu',
            'En cas contrari → trobar-se amb el guardià',
          ],
        },
        note: 'Les rutes comproven estadístiques numèriques i condicions vertaderes/falses. El text del jugador, com el seu nom, es pot reutilitzar en la redacció de la història mitjançant interpolació.',
      },
      {
        id: 'requirements',
        title: 'Requisits de les respostes',
        summary:
          'Fes que una resposta només estigui disponible quan el jugador en compleixi els requisits. Una clau trobada pot obrir una porta; prou monedes poden fer possible una compra.',
        steps: [
          'Tria Afegeix un requisit a la resposta que vulguis restringir.',
          'Selecciona una estadística numèrica i el seu valor mínim, o una condició que hagi de ser vertadera o falsa.',
          'Afegeix més requisits si cal. El jugador ha de complir tots els requisits d’aquella resposta.',
        ],
        example: {
          label: 'Guanyar-se l’opció',
          lines: [
            'Comprar el mapa → requereix almenys 3 monedes',
            'Obrir l’arxiu → requereix te_clau',
          ],
        },
        note: 'Les respostes que no compleixen els requisits es filtren del mode de joc actual. Connecta les respostes vàlides a una destinació perquè es puguin triar.',
      },
      {
        id: 'distributors',
        title: 'Nodes distribuïdors',
        summary:
          'Crea rutes més complexes sense mostrar al jugador una pregunta addicional. Un distribuïdor avalua les seves rutes en ordre i continua per la primera que es compleix.',
        steps: [
          'Crea un node distribuïdor i afegeix-hi una ruta.',
          'Tria una referència i una comparació. Les estadístiques numèriques admeten igual a, menor que i més gran que; les condicions comproven si són vertaderes o falses.',
          'Fes servir Afegeix una regla I per combinar comprovacions. S’han de complir totes les regles de la ruta.',
          'Fes servir Puja i Baixa per fixar la prioritat i connecta En cas contrari com a alternativa.',
        ],
        example: {
          label: 'La prioritat importa',
          lines: [
            'Ruta 1: confiança > 2 I te_clau → entrada secreta',
            'Ruta 2: confiança > 2 → entrada principal',
            'En cas contrari → guardià',
          ],
        },
        note: 'Guanya la primera ruta que es compleix. Posa les rutes més específiques abans que les més generals. Un distribuïdor és un pas d’encaminament, no una escena que el jugador llegeixi.',
      },
      {
        id: 'connections',
        title: 'Connecta al text o directament a les respostes',
        summary:
          'Tria si una connexió mostra el passatge del node següent o salta directament a les seves respostes. Torna a un menú sense obligar el jugador a rellegir-ne la introducció.',
        steps: [
          'Arrossega una connexió des d’un node, una resposta o una ruta d’un distribuïdor fins a la seva destinació.',
          'Connecta-la a l’entrada principal del node de destinació per mostrar-ne el text i després les respostes.',
          'Connecta-la a l’entrada de respostes per saltar el passatge i oferir les opcions directament.',
        ],
        example: {
          label: 'Dues maneres de tornar a la mateixa escena',
          lines: [
            'Primera visita → text del mercat + opcions de compra',
            'Tornada d’una botiga → només opcions de compra',
          ],
        },
        note: 'Si una destinació que només mostra respostes no té respostes disponibles, el mode de joc en mostra el passatge. Els esdeveniments del node s’executen igualment en arribar-hi.',
      },
    ],
  },
  {
    title: 'Fes-la personal',
    description:
      'Fes entrar qui llegeix a la història i dona-li un món on endinsar-se.',
    features: [
      {
        id: 'player-input',
        title: 'Demana text al jugador',
        summary:
          'Demana un nom, una idea o una altra resposta escrita i mantén-la disponible durant tota la partida. Les paraules de qui llegeix passen a formar part de la teva història.',
        steps: [
          'Crea un node de text lliure i escriu la pregunta al seu camp Pregunta.',
          'Indica a Propietat una clau com ara nom. És on es desa la resposta del jugador.',
          'Afegeix un text d’exemple si et resulta útil i connecta el node amb l’escena següent.',
          'Reutilitza aquesta propietat en escenes o respostes posteriors amb una variable.',
        ],
        example: {
          label: 'Un nom que viatja amb qui llegeix',
          lines: [
            'Pregunta: Com vols que et diguem?',
            'Propietat: nom · El jugador escriu: Morgan',
            'Més endavant: Hola de nou, #nom. → Hola de nou, Morgan.',
          ],
        },
        note: 'La resposta pertany a la partida actual. De moment, el mode de joc fa servir un botó Continua fix; els camps desats Text del botó i Descripció encara no s’hi mostren.',
      },
      {
        id: 'variables',
        title: 'Variables dins del text',
        summary:
          'Deixa que la redacció s’adapti al jugador. Insereix un nom, una estadística numèrica o una condició en un passatge o una resposta en lloc d’escriure una escena diferent per a cada variant.',
        steps: [
          'Crea la referència amb un esdeveniment o desa una resposta del jugador a la propietat d’un node de text lliure.',
          'Obre el mode concentració i fes servir Insereix una variable per triar la referència pel seu nom.',
          'Col·loca la variable allà on hagi d’aparèixer el seu valor actual, en una escena o en una resposta.',
        ],
        example: {
          label: 'D’una variable a una frase',
          lines: [
            'Ho has aconseguit, #nom.',
            'Propietat del jugador nom = Morgan',
            'Qui llegeix veu: Ho has aconseguit, Morgan.',
          ],
        },
        note: 'El text pla també admet la sintaxi #variable. Per a una propietat anomenada nom, fes servir #nom; les estadístiques numèriques i les condicions fan servir els seus ID de referència en text pla. El selector de variables s’encarrega d’aquests ID per tu. Els valors que falten es mostren com un guionet.',
      },
      {
        id: 'images',
        title: 'Imatges als teus nodes',
        summary:
          'Ambienta l’escena amb una il·lustració, el retrat d’un personatge o una pista visual. La imatge acompanya el text sense substituir les teves decisions.',
        steps: [
          'Obre el menú d’un node de contingut, de text lliure o final i tria Afegeix una imatge.',
          'Tria un fitxer d’imatge i espera que s’acabi de pujar.',
          'Previsualitza la història: la imatge apareix a sobre del passatge del node.',
        ],
        example: {
          label: 'Una pista visual',
          lines: [
            'Imatge: una carta amb el segell trencat',
            'Passatge: La lletra et resulta familiar.',
            'Opcions: Llegir-la / Amagar-la',
          ],
        },
        note: 'Els nodes distribuïdors serveixen per encaminar i no tenen camp d’imatge. Basic té un límit d’imatges; Creator inclou imatges il·limitades.',
      },
      {
        id: 'share-node',
        title: 'Compartir i nodes finals',
        summary:
          'Dona a un final un lloc on anar. Convida qui llegeix a compartir l’aventura, a descobrir la teva obra o a visitar els teus perfils socials.',
        steps: [
          'Crea un node final i escriu el passatge final.',
          'Activa Permet compartir a les opcions de la història per oferir Comparteix aquesta història.',
          'Fes servir Personalitza en compartir per definir el missatge i el text del botó d’aquell final.',
          'Amb una subscripció de pagament, afegeix Enllaços externs amb els teus propis textos i URL, com ara el teu web o els teus perfils de creador.',
        ],
        example: {
          label: 'Després de l’escena final',
          lines: [
            'Botó de compartir: Passa aquesta aventura',
            'Missatge compartit: He trobat l’entrada secreta. I tu?',
            'Enllaços externs: Més històries / Coneix el creador',
          ],
        },
        note: 'Per compartir es fa servir el menú de compartir del dispositiu quan està disponible i, si no, es copia l’enllaç. Els enllaços externs requereixen una subscripció de pagament. Són enllaços als teus perfils, no integracions amb cada xarxa social.',
      },
    ],
  },
  {
    title: 'Continua escrivint',
    description:
      'Endinsa’t en un passatge sense perdre la forma de tota l’aventura.',
    features: [
      {
        id: 'focus-mode',
        title: 'Mode concentració per a passatges llargs',
        summary:
          'Aparta’t del llenç i entra en un editor de text sense distraccions. Escriu un passatge llarg, dona-li format i torna al mapa quan vulguis.',
        steps: [
          'Fes servir el botó d’ampliar del camp de text d’una escena o d’una resposta per obrir el mode concentració.',
          'Escriu amb negreta, cursiva i variables. Els passatges de les escenes també admeten títols i llistes.',
          'Tria Tanca, o prem Escape, per aplicar el que has escrit al node.',
        ],
        example: {
          label: 'Del mapa al manuscrit',
          lines: [
            'Obre una escena → amplia’n el camp de text',
            'Escriu tot el passatge sense el soroll del llenç',
            'Tanca → tornes al mateix mapa de la història',
          ],
        },
        note: 'Ctrl+F o ⌘F obre el mode concentració mentre un camp de text de la història està actiu. Els camps de les respostes fan servir una barra de format en línia més senzilla.',
      },
      {
        id: 'organisation',
        title: 'Grups i marcs mòbils',
        summary:
          'Mantén comprensible una història gran. Plega un capítol en un grup o mantén-ne les escenes visibles dins d’un marc amb nom que es mou amb elles.',
        steps: [
          'Selecciona nodes relacionats al llenç.',
          'Tria Agrupa els nodes seleccionats per posar-los dins d’un grup. Obre el grup per treballar-hi i fes servir Surt per tornar.',
          'Tria Emmarca els nodes seleccionats si prefereixes mantenir-los visibles junts al mateix tauler. Posa nom al marc i arrossega’n la capçalera per moure el conjunt.',
          'Treu un marc quan ja no el necessitis; els seus nodes es queden a la història.',
        ],
        example: {
          label: 'Dues maneres d’organitzar el capítol 2',
          lines: [
            'Grup → un contenidor, amb les escenes a dins',
            'Marc → totes les escenes visibles, mogudes alhora',
          ],
        },
        note: 'Els grups i els marcs són eines per organitzar l’editor, no escenes jugables. No canvien la lògica de la història. El node inicial es queda al tauler principal, no dins d’un grup.',
      },
    ],
  },
]
