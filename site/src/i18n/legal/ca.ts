import type { LegalCopy } from './en'

export const legal: LegalCopy = {
  back: 'Torna a Trama',
  updated: 'Última actualització: {date}',
  contents: 'Índex',
  ownerTitle: 'Dades del titular',
  owner: { name: 'Titular', nif: 'NIF', email: 'Correu electrònic', address: 'Domicili' },
  privacy: {
    meta: {
      title: 'Política de privacitat — Trama',
      description:
        'Tractament de les dades personals a Trama: responsable, finalitats, bases jurídiques, destinataris, transferències internacionals, terminis de conservació i drets.',
    },
    title: 'Política de privacitat',
    intro:
      'Aquesta Política de privacitat informa els usuaris de trama.app sobre el tractament de les seves dades personals, de conformitat amb el Reglament (UE) 2016/679 (RGPD) i la Llei orgànica 3/2018, de protecció de dades personals i garantia dels drets digitals.',
    sections: [
      {
        id: 'controller',
        title: 'Responsable del tractament',
        blocks: [
          'El responsable del tractament de les dades personals descrites en aquesta política és {owner} (d’ara endavant, «el Titular»), les dades identificatives i de contacte del qual figuren al [final d’aquesta pàgina](owner).',
          'Per a qualsevol qüestió relativa a la protecció de dades, l’usuari pot adreçar-se a {email}.',
        ],
      },
      {
        id: 'data',
        title: 'Dades tractades',
        blocks: [
          {
            list: [
              'Dades del compte: adreça de correu electrònic, nom d’usuari i contrasenya, que es desa xifrada mitjançant una funció hash. Si l’usuari es registra amb Google, també es reben el nom, el correu electrònic i la fotografia de perfil associats al seu compte de Google.',
              'Continguts: les històries, els textos i les imatges que l’usuari crea o puja al servei.',
              'Dades de la subscripció: pla contractat, estat de la subscripció i data del cobrament següent. Les dades de la targeta es faciliten directament a Stripe i el Titular no hi té accés.',
              'Dades tècniques: adreça IP, tipus de navegador i registres d’accés que generen els proveïdors d’allotjament per al funcionament i la seguretat del servei.',
              'Dades d’ús: les pàgines de trama.app que visita l’usuari, el lloc des del qual hi arriba, el navegador, el dispositiu i el país aproximat, mesurats sense galetes (vegeu l’[apartat 9](cookies)).',
              'Dades dels jugadors de les històries, únicament quan l’autor activa el seguiment (vegeu l’[apartat 4](players)).',
            ],
          },
          'Les dades del compte són necessàries per prestar el servei: sense aquestes dades no és possible registrar-se ni utilitzar l’editor.',
        ],
      },
      {
        id: 'purposes',
        title: 'Finalitats i bases jurídiques',
        blocks: [
          {
            list: [
              'Gestionar el compte i prestar el servei (editor, reproductor i publicació d’històries). Base jurídica: execució del contracte (art. 6.1.b RGPD).',
              'Gestionar la subscripció, els cobraments i la facturació. Base jurídica: execució del contracte i compliment de les obligacions fiscals i comptables (art. 6.1.b i 6.1.c RGPD).',
              'Enviar les comunicacions necessàries per al servei: confirmació del compte, restabliment de la contrasenya i avisos relatius a la subscripció o a la modificació d’aquests textos. Base jurídica: execució del contracte (art. 6.1.b RGPD).',
              'Garantir la seguretat del servei i prevenir usos fraudulents o abusius. Base jurídica: interès legítim del Titular a protegir el servei i els seus usuaris (art. 6.1.f RGPD).',
              'Mesurar de manera agregada l’ús del lloc web i de l’aplicació per millorar-los. Base jurídica: interès legítim del Titular a conèixer com s’utilitza el servei (art. 6.1.f RGPD). L’usuari s’hi pot oposar en qualsevol moment escrivint al Titular; bloquejar l’script de DataFast al navegador també n’impedeix la mesura.',
            ],
          },
          'El Titular no ven dades personals, no les utilitza amb finalitats publicitàries, no elabora perfils ni pren decisions automatitzades. Tampoc no envia comunicacions comercials; si en el futur ho fes, en sol·licitaria prèviament el consentiment de l’usuari.',
        ],
      },
      {
        id: 'players',
        title: 'Dades dels jugadors',
        blocks: [
          'Jugar una història no requereix registre. Si l’autor d’una història activa la funció de seguiment, cada partida es registra i l’autor la pot consultar. Es registren el nom o l’identificador que sol·liciti la història (o «anònim»), les respostes triades, les escenes visitades amb la data i l’hora, i les estadístiques i condicions amb què acaba la partida.',
          'Pel que fa a aquestes dades, l’autor de la història és el responsable del tractament i el Titular actua com a encarregat del tractament per compte seu, en els termes de l’article 28 del RGPD: les conserva únicament per mostrar-les a l’autor i no les utilitza per a cap altra finalitat. Correspon a l’autor informar els jugadors i disposar d’una base jurídica adequada, especialment quan els jugadors siguin menors d’edat.',
          'Els jugadors poden exercir els seus drets davant l’autor de la història. Les sol·licituds que rebi el Titular es traslladaran a l’autor.',
        ],
      },
      {
        id: 'providers',
        title: 'Destinataris',
        blocks: [
          'Les dades no es cedeixen a tercers, llevat d’obligació legal. Per prestar el servei, el Titular recorre als proveïdors següents, que tracten les dades com a encarregats del tractament en virtut d’un contracte d’acord amb l’article 28 del RGPD:',
          {
            list: [
              'Supabase Pte. Ltd.: base de dades, autenticació, emmagatzematge d’imatges i enviament dels correus del compte. Les dades s’allotgen en servidors de la Unió Europea (París).',
              'Vercel Inc.: allotjament del lloc web i de l’aplicació.',
              'Amazon Web Services: redimensionament de les imatges pujades, en servidors situats a Londres.',
              'JustShipIt Pte. Ltd. (DataFast): analítica del lloc web i de l’aplicació, sense galetes.',
            ],
          },
          'Els proveïdors següents tracten, a més, determinades dades com a responsables independents, d’acord amb les seves pròpies polítiques de privacitat:',
          {
            list: [
              'Stripe, que processa els pagaments i gestiona les subscripcions i, com a responsable, tracta les dades de pagament per prevenir el frau i complir les seves obligacions legals ([política de privacitat d’Stripe](stripe)).',
              'Google, únicament si l’usuari decideix registrar-se o iniciar la sessió amb el seu compte de Google.',
            ],
          },
          'Així mateix, les dades es podran comunicar a les autoritats competents quan hi hagi una obligació legal.',
        ],
      },
      {
        id: 'transfers',
        title: 'Transferències internacionals',
        blocks: [
          'Alguns d’aquests proveïdors tenen la seu o poden tractar dades fora de l’Espai Econòmic Europeu: Supabase (Singapur i els Estats Units), Vercel, Stripe i Google (els Estats Units), Amazon Web Services (el Regne Unit) i DataFast (Singapur, amb servidors principalment als Estats Units). Aquestes transferències s’emparen en les clàusules contractuals tipus aprovades per la Comissió Europea (en el cas de DataFast, les que apliquen els seus propis proveïdors), en el Marc de Privacitat de Dades UE-EUA per a les entitats que s’hi han adherit i, en el cas del Regne Unit, en la decisió d’adequació de la Comissió Europea.',
        ],
      },
      {
        id: 'retention',
        title: 'Terminis de conservació',
        blocks: [
          {
            list: [
              'Dades del compte i continguts: mentre el compte estigui actiu. Després de la sol·licitud de supressió, s’eliminen en un termini màxim de 30 dies, excepte les còpies de seguretat, que s’eliminen segons el seu cicle de rotació.',
              'Partides registrades: mentre existeixi la història o fins que el seu autor les elimini.',
              'Dades de facturació: durant els terminis que exigeix la normativa fiscal i mercantil, amb caràcter general entre quatre i sis anys.',
              'Registres tècnics: durant els terminis limitats que fixen els proveïdors d’allotjament.',
              'Dades d’analítica: els visitants es compten amb un identificador que canvia cada 24 hores, de manera que les visites de dies diferents no es poden vincular a la mateixa persona; les estadístiques resultants es conserven mentre el Titular utilitzi DataFast.',
            ],
          },
          'Un cop acabats aquests terminis, les dades es podran conservar bloquejades únicament durant el temps necessari per atendre possibles responsabilitats legals.',
        ],
      },
      {
        id: 'rights',
        title: 'Drets',
        blocks: [
          'L’usuari pot exercir els drets d’accés, rectificació, supressió, oposició, limitació del tractament i portabilitat de les seves dades mitjançant un correu electrònic a {email}, enviat des de l’adreça associada al seu compte. El nom d’usuari es pot modificar directament des del perfil. Les sol·licituds s’atendran en el termini d’un mes.',
          'Si considera que el tractament no s’ajusta a la normativa, l’usuari pot presentar una reclamació davant l’Agència Espanyola de Protecció de Dades ([www.aepd.es](aepd)) o davant l’autoritat de control del seu estat de residència.',
        ],
      },
      {
        id: 'cookies',
        title: 'Galetes i emmagatzematge local',
        blocks: [
          'Trama no utilitza galetes publicitàries ni analítiques. Per comptar les visites utilitza DataFast en el mode sense galetes: identifica cada visitant amb un codi derivat de l’adreça IP i del navegador que canvia cada 24 hores i, com a màxim, desa al navegador un registre temporal que s’esborra en acabar la sessió de navegació. A banda d’això, el servei només desa al navegador de l’usuari (localStorage) la informació necessària per al seu funcionament:',
          {
            list: [
              'la sessió iniciada;',
              'l’idioma i el tema visual, clar o fosc, triats per l’usuari;',
              'l’última història oberta i l’estat del seu tauler.',
            ],
          },
          'Es tracta d’informació tècnica o de preferències triades expressament per l’usuari, de manera que no requereix consentiment (art. 22.2 de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic). Durant el pagament, la pàgina d’Stripe utilitza les seves pròpies galetes per processar l’operació i prevenir el frau; el mateix passa a la pàgina de Google en iniciar la sessió amb Google.',
        ],
      },
      {
        id: 'security',
        title: 'Seguretat',
        blocks: [
          'El Titular aplica mesures tècniques i organitzatives adequades per protegir les dades: les comunicacions es xifren mitjançant HTTPS, les contrasenyes es desen xifrades i cada autor només pot accedir a les seves pròpies històries. Si es produís una violació de la seguretat que afectés dades personals, es notificaria a l’autoritat de control i, quan escaigui, a les persones afectades, d’acord amb els articles 33 i 34 del RGPD.',
        ],
      },
      {
        id: 'changes',
        title: 'Modificacions',
        blocks: [
          'El Titular podrà modificar aquesta política per adaptar-la a canvis normatius o del servei. Els canvis rellevants es comunicaran per correu electrònic o a l’aplicació abans de la seva entrada en vigor. La data de l’última actualització figura al principi d’aquest document.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Condicions de servei — Trama',
      description:
        'Condicions d’ús i contractació de Trama: compte, subscripció, cancel·lació i desistiment, continguts de l’usuari, ús acceptable i responsabilitat.',
    },
    title: 'Condicions de servei',
    intro:
      'Aquestes Condicions de servei regulen l’accés a trama.app i el seu ús. La creació d’un compte implica acceptar-les íntegrament, per la qual cosa es recomana llegir-les amb atenció.',
    sections: [
      {
        id: 'provider',
        title: 'Titular del servei',
        blocks: [
          'El lloc web i l’aplicació disponibles a trama.app (d’ara endavant, «Trama» o «el Servei») són titularitat de {owner}, les dades identificatives del qual figuren al [final d’aquesta pàgina](owner).',
          'En aquestes condicions, «el Titular» designa aquesta persona i «l’Usuari», qualsevol persona que utilitzi el Servei.',
        ],
      },
      {
        id: 'service',
        title: 'Objecte',
        blocks: [
          'Trama és una eina en línia per escriure històries interactives ramificades sobre un tauler, provar-les i compartir-les mitjançant un enllaç perquè altres persones les juguin. Jugar una història compartida és gratuït i no requereix compte. La creació d’històries requereix un compte i una subscripció de pagament; els plans i els seus preus es detallen a la [pàgina de preus](pricing).',
        ],
      },
      {
        id: 'account',
        title: 'Registre i compte',
        blocks: [
          {
            list: [
              'L’Usuari ha de facilitar dades veraces i mantenir actualitzada la seva adreça de correu electrònic, que és el mitjà de comunicació amb el Titular.',
              'L’Usuari és responsable de custodiar la seva contrasenya i de l’ús que es faci del seu compte, i ha de comunicar al Titular qualsevol ús no autoritzat del qual tingui coneixement.',
              'Els menors d’edat necessiten l’autorització dels seus pares o tutors legals per registrar-se.',
            ],
          },
        ],
      },
      {
        id: 'payment',
        title: 'Plans, preus i pagament',
        blocks: [
          {
            list: [
              'Els preus s’indiquen en euros a la [pàgina de preus](pricing) i inclouen l’IVA.',
              'Les subscripcions són mensuals o anuals i es paguen per avançat amb targeta a través d’Stripe. Es renoven automàticament al final de cada període, per la mateixa durada i al preu vigent, llevat de cancel·lació prèvia.',
              'L’Usuari pot cancel·lar la subscripció en qualsevol moment des del seu perfil. La cancel·lació impedeix la renovació següent: l’Usuari conserva l’accés a les funcions de pagament fins al final del període pagat i no es fan nous cobraments. El període en curs no es reemborsa, excepte en els supòsits de la clàusula següent o quan ho exigeixi la llei.',
              'Qualsevol canvi de preu es comunicarà amb almenys 30 dies d’antelació i s’aplicarà a partir de la renovació següent. L’Usuari que no l’accepti podrà cancel·lar la subscripció abans d’aquesta data.',
              'Si no es pot fer un cobrament, el Titular podrà suspendre les funcions de pagament fins que es regularitzi.',
            ],
          },
        ],
      },
      {
        id: 'withdrawal',
        title: 'Dret de desistiment',
        blocks: [
          'L’Usuari que tingui la condició de consumidor disposa de 14 dies naturals des de la contractació per desistir de la subscripció, sense necessitat de justificació, mitjançant una declaració inequívoca enviada a {email}. Pot utilitzar el model següent, tot i que no és obligatori:',
          '«Per la present li comunico que desisteixo del meu contracte de subscripció a Trama. Data de contractació: [data]. Nom: [nom]. Correu electrònic del compte: [correu]. Data: [data].»',
          'El Titular reemborsarà l’import pagat en un termini màxim de 14 dies des de la recepció de la declaració, pel mateix mitjà de pagament utilitzat. Si l’Usuari hagués sol·licitat expressament que el Servei comencés durant el termini de desistiment, es descomptarà l’import proporcional a la part del Servei ja prestada.',
        ],
      },
      {
        id: 'content',
        title: 'Continguts de l’Usuari',
        blocks: [
          {
            list: [
              'L’Usuari conserva tots els drets sobre les històries i les imatges que crea o puja. El Titular no n’adquireix cap titularitat.',
              'L’Usuari concedeix al Titular una llicència gratuïta, no exclusiva i limitada al que és necessari per prestar el Servei: emmagatzemar els continguts, processar-los (per exemple, redimensionar les imatges) i mostrar-los a les persones amb qui l’Usuari els comparteixi. La llicència s’extingeix quan l’Usuari elimina els continguts o el seu compte, excepte pel que fa a les còpies de seguretat fins que s’eliminin.',
              'L’Usuari és l’únic responsable dels continguts que publica i garanteix que en té els drets necessaris, inclosos textos, imatges i personatges.',
              'En activar el seguiment en una història, l’Usuari encarrega al Titular el registre de les seves partides. L’[apartat 4 de la Política de privacitat](players) descriu aquest tractament i constitueix el contracte d’encàrrec del tractament previst a l’article 28 del RGPD.',
              'El Titular fa còpies de seguretat, però no pot garantir l’absència de pèrdues de dades. Es recomana a l’Usuari conservar una còpia dels seus continguts importants.',
            ],
          },
        ],
      },
      {
        id: 'use',
        title: 'Ús acceptable',
        blocks: [
          'L’Usuari es compromet a no utilitzar el Servei per:',
          {
            list: [
              'publicar continguts il·lícits o que vulnerin drets de tercers, com els de propietat intel·lectual, la intimitat o la pròpia imatge;',
              'assetjar o amenaçar altres persones, incitar a l’odi o a la violència, o difondre continguts sexuals que involucrin menors;',
              'distribuir programari maliciós, comunicacions no sol·licitades o continguts enganyosos, com la pesca de credencials (phishing);',
              'atacar o sobrecarregar el Servei, accedir sense autorització al Servei o a comptes d’altri, o extreure’n continguts de manera massiva;',
              'revendre l’accés al Servei.',
            ],
          },
          'Qualsevol persona pot notificar continguts presumptament il·lícits allotjats a Trama escrivint a {email}, amb indicació de la seva ubicació i dels motius. El Titular podrà retirar els continguts o suspendre els comptes que incompleixin aquestes condicions, i n’informarà l’Usuari dels motius quan sigui possible. En casos greus, podrà tancar el compte sense avís previ.',
        ],
      },
      {
        id: 'property',
        title: 'Propietat intel·lectual i industrial',
        blocks: [
          'L’aplicació, el seu disseny, el nom i el logotip de Trama i la història d’exemple inclosa en els comptes nous pertanyen al Titular. L’Usuari pot editar la història d’exemple i utilitzar-la com a base per a les seves pròpies històries. El motor d’històries (@trama-app/engine) es distribueix com a codi obert amb llicència MIT. Fora d’aquests supòsits, l’ús del Servei no atorga a l’Usuari cap dret sobre aquests elements.',
        ],
      },
      {
        id: 'availability',
        title: 'Disponibilitat i modificacions del Servei',
        blocks: [
          'El Titular procurarà mantenir el Servei disponible i els continguts protegits, però no en garanteix el funcionament ininterromput: hi pot haver interrupcions per manteniment, errors tècnics o causes alienes al seu control. El Titular podrà millorar, modificar o retirar funcionalitats. Si una modificació suprimeix una prestació essencial del pla contractat, es comunicarà amb antelació i l’Usuari podrà cancel·lar la subscripció amb el reemborsament de la part no gaudida.',
        ],
      },
      {
        id: 'liability',
        title: 'Responsabilitat',
        blocks: [
          'El Servei es presta en l’estat en què es troba. El Titular respon dels danys causats per dol o culpa greu i en els altres casos en què la llei no permeti excloure’n la responsabilitat. Quan l’Usuari no tingui la condició de consumidor, la responsabilitat del Titular es limita a l’import pagat per l’Usuari en els 12 mesos anteriors al fet causant i exclou els danys indirectes, com el lucre cessant. Res del que disposen aquestes condicions no limita els drets que la normativa de protecció dels consumidors reconeix a l’Usuari.',
        ],
      },
      {
        id: 'termination',
        title: 'Baixa i resolució',
        blocks: [
          'L’Usuari pot deixar d’utilitzar el Servei en qualsevol moment, cancel·lant la subscripció des del seu perfil i sol·licitant l’eliminació del seu compte a {email}. Els continguts i les dades s’eliminaran d’acord amb la [Política de privacitat](privacy). El Titular podrà resoldre el contracte i tancar el compte en cas d’incompliment greu o reiterat d’aquestes condicions.',
        ],
      },
      {
        id: 'changes',
        title: 'Modificació de les condicions',
        blocks: [
          'El Titular podrà modificar aquestes condicions per motius justificats, com ara canvis normatius, tècnics o del Servei. Les modificacions es comunicaran per correu electrònic o a l’aplicació amb almenys 15 dies d’antelació a la seva entrada en vigor. L’Usuari que no les accepti podrà cancel·lar la subscripció abans d’aquesta data; l’ús continuat del Servei després de la seva entrada en vigor n’implica l’acceptació.',
        ],
      },
      {
        id: 'law',
        title: 'Legislació aplicable i jurisdicció',
        blocks: [
          'Aquestes condicions es regeixen per la legislació espanyola. Quan l’Usuari sigui consumidor, seran competents els jutjats i tribunals del seu domicili, i conservarà la protecció que li atorguin les normes imperatives del seu país de residència. Abans d’anar a la via judicial, l’Usuari pot adreçar la seva reclamació a {email} per cercar una solució amistosa, o acudir al Sistema Arbitral de Consum o als serveis de consum de la seva comunitat autònoma.',
        ],
      },
    ],
  },
}
