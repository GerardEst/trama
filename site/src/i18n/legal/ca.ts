import type { LegalCopy } from './en'

export const legal: LegalCopy = {
  back: 'Torna a Trama',
  updated: 'Última actualització: {date}',
  contents: 'Contingut',
  owner: { name: 'Titular', nif: 'NIF', email: 'Correu electrònic', address: 'Domicili' },
  privacy: {
    meta: {
      title: 'Política de privacitat — Trama',
      description:
        'Quines dades personals tracta Trama, per a què, quins proveïdors ens ajuden i com exercir els teus drets. Sense galetes de publicitat ni d’analítica.',
    },
    title: 'Política de privacitat',
    intro:
      'Quines dades personals tracta Trama, per a què, qui més les tracta i com les controles. Només recollim el que el servei necessita per funcionar.',
    sections: [
      {
        id: 'controller',
        title: 'Qui n’és el responsable',
        blocks: [
          'Trama (trama.app) la gestiona la persona que figura a continuació, responsable del tractament de les dades personals que descriu aquesta política:',
          { owner: true },
          'Per a qualsevol qüestió sobre les teves dades, escriu a {email}.',
        ],
      },
      {
        id: 'data',
        title: 'Quines dades tractem',
        blocks: [
          {
            list: [
              'Compte: el teu correu electrònic, el teu nom d’usuari i la teva contrasenya, que desem xifrada i mai en text pla. Si entres amb Google, Google ens comparteix el teu nom, el teu correu i la teva foto de perfil.',
              'Les teves històries: tot el que escrius a l’editor i les imatges que hi puges.',
              'Subscripció: el teu pla, el seu estat i la data del proper pagament. Les dades de la targeta les introdueixes a Stripe i mai no ens arriben.',
              'Dades tècniques: l’adreça IP, el navegador i els registres d’accés que desen els nostres proveïdors per fer funcionar i protegir el servei.',
              'Dades de qui juga les teves històries, només si actives el seguiment (vegeu l’[apartat 4](players)).',
            ],
          },
        ],
      },
      {
        id: 'purposes',
        title: 'Per a què les fem servir i amb quina base legal',
        blocks: [
          {
            list: [
              'Per crear el teu compte i oferir-te l’editor, el playground i l’opció de compartir històries. És necessari per complir el contracte amb tu (art. 6.1.b RGPD).',
              'Per cobrar la subscripció i conservar les factures, per complir el contracte i la normativa fiscal (art. 6.1.b i 6.1.c).',
              'Per enviar-te els correus que el servei necessita: confirmar el teu compte, restablir la contrasenya i avisos sobre la teva subscripció o sobre canvis en aquests textos (art. 6.1.b).',
              'Per mantenir el servei segur i evitar abusos, que és el nostre interès legítim (art. 6.1.f).',
            ],
          },
          'No venem les teves dades, no les fem servir per a publicitat i no prenem decisions automatitzades sobre tu. Trama no té butlletí; si algun dia n’hi afegim un, primer et demanarà el consentiment.',
        ],
      },
      {
        id: 'players',
        title: 'Dades de qui juga les teves històries',
        blocks: [
          'Jugar una història no requereix compte. Si l’autor activa el seguiment, cada partida es desa i l’autor la pot veure: el nom o l’identificador que demani la història (o «anònim»), les respostes triades, les escenes visitades i quan, i les estadístiques i condicions amb què va acabar la partida.',
          'D’aquestes dades, el responsable és l’autor i Trama n’és l’encarregat del tractament, que actua per compte seu (art. 28 RGPD): només les desem per mostrar-les a l’autor i no les fem servir per a res més. L’autor que activa el seguiment ha d’informar els jugadors i tenir una base legal per fer-ho, amb una cura especial si els jugadors són menors.',
          'Els jugadors que vulguin exercir els seus drets s’han d’adreçar a l’autor de la història. Si ens escriuen a nosaltres, li farem arribar la petició.',
        ],
      },
      {
        id: 'providers',
        title: 'Qui més les tracta',
        blocks: [
          'Ens recolzem en aquests proveïdors, que tracten les dades només per compte nostre i amb un contracte d’encàrrec del tractament:',
          {
            list: [
              'Supabase: base de dades, comptes, emmagatzematge d’imatges i correus del compte. Servidors a la Unió Europea (París).',
              'Vercel: allotjament del web i de l’aplicació.',
              'Stripe: pagaments i subscripcions.',
              'Amazon Web Services: redimensionar les imatges que puges. Servidors a Londres.',
              'Google: només si decideixes entrar amb el teu compte de Google.',
            ],
          },
          'També comunicarem dades a les autoritats quan la llei ho exigeixi.',
        ],
      },
      {
        id: 'transfers',
        title: 'Transferències fora de la Unió Europea',
        blocks: [
          'Vercel, Stripe i Google tenen la seu als Estats Units o hi poden tractar dades, i AWS redimensiona les imatges al Regne Unit. Aquestes transferències estan emparades pel Marc de Privacitat de Dades UE-EUA, per les clàusules contractuals tipus de la Comissió Europea o, en el cas del Regne Unit, per una decisió d’adequació.',
        ],
      },
      {
        id: 'retention',
        title: 'Quant de temps les conservem',
        blocks: [
          {
            list: [
              'Compte i històries: mentre el teu compte estigui obert. Quan ens demanis eliminar-lo, les esborrarem en un termini de 30 dies; les còpies de seguretat desapareixen a mesura que caduquen.',
              'Partides: mentre existeixi la història o fins que el seu autor les esborri.',
              'Dades de facturació: el temps que exigeixen les lleis fiscals i mercantils, en general entre quatre i sis anys.',
              'Registres tècnics: els terminis curts que fixen els nostres proveïdors.',
            ],
          },
        ],
      },
      {
        id: 'rights',
        title: 'Els teus drets',
        blocks: [
          'Pots demanar accedir a les teves dades, rectificar-les, suprimir-les, limitar-ne o oposar-te al tractament i rebre’n una còpia en un format reutilitzable (portabilitat). El nom d’usuari el pots canviar al teu perfil; per a tota la resta, inclòs eliminar el teu compte, escriu a {email} des del correu del teu compte. Et respondrem en el termini d’un mes.',
          'Si creus que no hem tractat bé les teves dades, pots presentar una reclamació a l’Agència Espanyola de Protecció de Dades ([aepd.es](aepd)) o a l’autoritat del teu país.',
        ],
      },
      {
        id: 'cookies',
        title: 'Galetes i emmagatzematge local',
        blocks: [
          'Trama no fa servir galetes de publicitat ni d’analítica, ni seguiment de tercers. Al teu navegador (localStorage) només desa el que necessita per funcionar:',
          {
            list: [
              'La teva sessió, perquè no hagis de tornar a entrar.',
              'El teu idioma i el teu tema clar o fosc.',
              'L’última història que vas obrir i com vas deixar-ne el tauler.',
            ],
          },
          'Tot plegat és estrictament necessari o recorda una tria teva, de manera que no requereix consentiment. Quan pagues, la pàgina d’Stripe fa servir les seves pròpies galetes per processar el pagament i prevenir el frau, tal com explica la [política de privacitat d’Stripe](stripe). Entrar amb Google fa el mateix a la pàgina de Google.',
        ],
      },
      {
        id: 'security',
        title: 'Seguretat',
        blocks: [
          'Les connexions van xifrades (HTTPS), les contrasenyes es desen xifrades i cada autor només pot accedir a les seves històries. Cap sistema no és completament segur: si una bretxa afectés les teves dades, t’avisaríem a tu i a l’autoritat tal com exigeix la llei.',
        ],
      },
      {
        id: 'changes',
        title: 'Canvis en aquesta política',
        blocks: [
          'Si canviem aquesta política en alguna cosa important, t’avisarem per correu o a l’aplicació abans que s’apliqui. La data de dalt indica la versió vigent.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Condicions de servei — Trama',
      description:
        'Les condicions per fer servir Trama: comptes, subscripcions i cancel·lació, els teus drets sobre les teves històries, ús acceptable i responsabilitat.',
    },
    title: 'Condicions de servei',
    intro:
      'L’acord entre tu i Trama quan fas servir trama.app. En crear un compte acceptes aquestes condicions, així que et demanem que les llegeixis.',
    sections: [
      {
        id: 'provider',
        title: 'Qui presta el servei',
        blocks: [
          'Aquestes condicions regulen l’ús del web i l’aplicació de trama.app («Trama» o «el servei»), que presta:',
          { owner: true },
        ],
      },
      {
        id: 'service',
        title: 'El servei',
        blocks: [
          'Trama és una eina en línia per escriure històries interactives ramificades en un tauler, provar-les i compartir-les amb un enllaç perquè altres les juguin. Jugar una història compartida és gratuït i no requereix compte. Per escriure històries cal un compte i una subscripció; la [pàgina de preus](pricing) descriu cada pla i el seu preu.',
        ],
      },
      {
        id: 'account',
        title: 'El teu compte',
        blocks: [
          {
            list: [
              'Dona dades veritables i mantén el teu correu al dia: és com contactem amb tu.',
              'Guarda bé la teva contrasenya. Ets responsable del que es faci amb el teu compte; avisa’ns si creus que una altra persona el fa servir.',
              'Si ets menor d’edat, necessites el permís dels teus pares o tutors legals.',
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
              'Els preus es mostren en euros a la [pàgina de preus](pricing), amb l’IVA inclòs.',
              'Les subscripcions són mensuals o anuals i es paguen per avançat amb targeta a través d’Stripe. Es renoven automàticament al final de cada període, per la mateixa durada i al preu vigent, fins que cancel·lis.',
              'Pots cancel·lar quan vulguis des del teu perfil. Cancel·lar atura la renovació: conserves les funcions de pagament fins al final del període que ja has pagat i no se’t tornarà a cobrar. Aquest període no es reemborsa, excepte el que diu l’apartat següent o quan la llei ho exigeixi.',
              'Si canviem un preu, t’avisarem amb almenys 30 dies d’antelació. El preu nou s’aplica a partir de la teva propera renovació i pots cancel·lar abans.',
              'Si no es pot cobrar un pagament, podem suspendre les funcions de pagament fins que es resolgui.',
            ],
          },
        ],
      },
      {
        id: 'withdrawal',
        title: 'Dret de desistiment',
        blocks: [
          'Si ets consumidor a la Unió Europea, pots desistir en els 14 dies següents a la subscripció, sense donar cap motiu, escrivint a {email}. Com que el servei comença de seguida, en subscriure’t ens demanes que te’l prestem durant aquests 14 dies; si desisteixes, et retornarem el que vas pagar menys la part dels dies en què ja has tingut el servei.',
        ],
      },
      {
        id: 'content',
        title: 'Les teves històries',
        blocks: [
          {
            list: [
              'El que escrius és teu. Trama no reclama cap propietat sobre les teves històries ni les teves imatges.',
              'Ens dones una llicència gratuïta i no exclusiva, limitada al que necessita el servei: desar les teves històries, processar-les (per exemple, redimensionar les teves imatges) i mostrar-les a qui les comparteixis. S’acaba quan les esborres o esborres el teu compte, excepte les còpies de seguretat fins que caduquin.',
              'Ets responsable del que publiques i garanteixes que en tens els drets: textos, imatges, personatges i qualsevol altra cosa que hi incloguis.',
              'Si actives el seguiment en una història, ens demanes que en registrem les partides per compte teu. L’apartat 4 de la [política de privacitat](players) descriu aquest tractament i és el nostre contracte d’encàrrec del tractament segons l’article 28 del RGPD.',
              'Fem còpies de seguretat, però no podem descartar qualsevol pèrdua: guarda la teva pròpia còpia del que sigui important.',
            ],
          },
        ],
      },
      {
        id: 'use',
        title: 'Ús acceptable',
        blocks: [
          'No facis servir Trama per:',
          {
            list: [
              'publicar contingut il·legal o que vulneri drets d’altres, com la propietat intel·lectual, la intimitat o la pròpia imatge;',
              'assetjar o amenaçar ningú, incitar a l’odi o a la violència, o publicar contingut sexual que involucri menors;',
              'difondre programari maliciós, correu brossa o contingut enganyós com la pesca de credencials (phishing);',
              'atacar o sobrecarregar el servei, accedir-hi o accedir a comptes d’altri sense permís, o extreure’n el contingut de manera massiva;',
              'revendre l’accés al servei.',
            ],
          },
          'Per denunciar un contingut allotjat a Trama, escriu a {email} indicant on és i per què. Si trobem continguts o conductes així, podem retirar el contingut o suspendre el compte, explicant-te’n el motiu quan sigui possible. En casos greus, podem tancar el compte sense avís previ.',
        ],
      },
      {
        id: 'property',
        title: 'Propietat intel·lectual de Trama',
        blocks: [
          'L’aplicació, el seu disseny, el nom i el logotip de Trama i la història d’exemple amb què comencen els comptes nous pertanyen al seu titular. Pots editar la història d’exemple i fer-la servir com a base per a les teves. El motor d’històries (@trama-app/engine) és codi obert amb llicència MIT. Fer servir Trama no et dona cap altre dret sobre ella més enllà de fer-la servir com descriuen aquestes condicions.',
        ],
      },
      {
        id: 'availability',
        title: 'Disponibilitat i canvis en el servei',
        blocks: [
          'Treballem perquè Trama estigui disponible i les teves històries segures, però no podem prometre que no falli mai: hi pot haver interrupcions per manteniment, errors o causes alienes a nosaltres. Podem millorar, canviar o retirar funcions. Si un canvi elimina alguna cosa essencial del teu pla de pagament, t’avisarem amb antelació i podràs cancel·lar amb el reemborsament de la part no utilitzada.',
        ],
      },
      {
        id: 'liability',
        title: 'Responsabilitat',
        blocks: [
          'Trama s’ofereix tal com és. Responem dels danys que causem amb dol o negligència greu i de tot allò que la llei no ens permeti excloure. Fora d’això, la nostra responsabilitat es limita al que hagis pagat en els 12 mesos anteriors a l’incident, i no responem de pèrdues indirectes com el lucre cessant. Res d’aquestes condicions no limita els teus drets com a consumidor.',
        ],
      },
      {
        id: 'termination',
        title: 'Tancar el teu compte',
        blocks: [
          'Pots deixar de fer servir Trama quan vulguis: cancel·la la subscripció des del teu perfil i demana’ns que eliminem el teu compte a {email}. Esborrarem les teves històries i les teves dades com descriu la [política de privacitat](privacy). Podem tancar els comptes que incompleixin aquestes condicions de manera greu o reiterada.',
        ],
      },
      {
        id: 'changes',
        title: 'Canvis en aquestes condicions',
        blocks: [
          'Si canviem aquestes condicions, t’avisarem per correu o a l’aplicació almenys 15 dies abans que s’apliquin. Si no hi estàs d’acord, pots cancel·lar abans; si continues fent servir Trama, acceptes les condicions noves.',
        ],
      },
      {
        id: 'law',
        title: 'Llei aplicable i conflictes',
        blocks: [
          'Aquestes condicions es regeixen per la llei espanyola. Si ets consumidor, pots anar als tribunals del lloc on vius i conserves la protecció de les lleis imperatives del teu país. Abans, escriu-nos a {email} i mirarem de resoldre el problema. També pots acudir al sistema arbitral de consum o a l’oficina de consum de la teva localitat.',
        ],
      },
    ],
  },
}
