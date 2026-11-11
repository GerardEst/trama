// The directions under comparison. A to D each started from a seed generated once
// by a shell script (tr -dc 'A-Za-z0-9' </dev/urandom | head -c 128), never re-rolled.
// E has no seed: it is the synthesis the author chose after comparing them.

export const DIRECTIONS = [
  {
    id: 'a',
    name: 'Clariana',
    seed: 'oa0SxjzexTrQAsslku4xdaytKfFE3zpuUrih6NHcZNRamk1UJrZzkTUes9JNHI0Rv25wTnjeSiqtp7RA6VZ0tH9Vy0sOTWFOvWuO3kvr2MgpVsJ9bw4JDfwP40c8pLEo',
    idea: 'Un paisatge pintat que s’obre sobre el blanc. Calma, serif ajustada i una sola idea per bloc.',
    readings: [
      'Les úniques tirades de dígits són 25 i 40. 25:40 = 5:8, una raó de Fibonacci: tota la maqueta divideix 5:8 i els espais són 5, 8, 13, 21, 34, 55, 89.',
      'Els trossos hexadecimals fFE3 i 40c8 junts fan #FFE340C8, un groc amb alfa molt proper a l’ambre de Trama: és el marcador dels títols.',
      'El dígit més freqüent és el 0 (5 cops): el buit mana, i el fons és blanc.',
      'Comença amb o i acaba amb o (i conté OTWFO): la pàgina s’obre i es tanca amb la mateixa pintura.',
      'Cap palíndrom: cap simetria. Tot és asimètric, menys l’heroi.',
    ],
    type: 'Baskervville ajustada + Raleway',
  },
  {
    id: 'b',
    name: 'La Vall',
    seed: 'ueVFcIdnv1qhO6ghnjZ2VIqzKOMybuOTMimlHuTjpdBKxCpVdkJVv2JScVqdHoEc2AgExCFnRzk3t60syiV54q26un1QknN5xlKigeN5qiG0cWVhg8HUtUKhoLFMmR8L',
    idea: 'Les dues referències de Dribbble al peu de la lletra: títol centrat dins d’una vall pintada. A sota, totes les funcions amb exemples jugables, comparativa verificada i dades llegibles per a una IA.',
    readings: [
      'La V és el caràcter més freqüent (7 cops, 9 sense distingir caixa): la vall. La pintura s’obre en forma de V al voltant del títol.',
      'Les úniques tirades de dígits són 60, 54 i 26: títols de secció de 60 px, explicacions de 54 caràcters d’amplada com a màxim i preguntes de 26 px.',
      'L’únic tros hexadecimal llarg, Ec2A, s’expandeix a #EECC22AA: un groc amb alfa, el marcador.',
      'La suma ASCII mòdul 360 és 254: el to violaci de la boira de les píndoles.',
      'xC i N5 es repeteixen dos cops cadascun i l’arrel digital és 3: cada exemple té parelles (configuració i resultat) dins de tres nivells (funció, exemple, documentació).',
    ],
    type: 'Instrument Serif + Instrument Sans',
  },
  {
    id: 'c',
    name: 'Mirall',
    seed: '1UBccmGFJrDAD5UAAXZuzrlFbVrCIXtxK5Msc0kegTPEQXqNRN4nZkBJyjZ8HKe6t7HuJtTjxakjtMXSgd3BoTcN40T7KEUnK6oX385lOdO0om63Qq3CrfUdI6w13ITi',
    idea: 'La pàgina partida en dos: el que fas tu i el que veu el lector, a banda i banda d’un fil.',
    readings: [
      'És la cadena més plena de miralls: JtTj, 3Qq3, OdO, O0o, ITi, Jyj. Sis punts de simetria, i dos de quatre caràcters. La pàgina es plega per la meitat.',
      'L’única amb més majúscules que minúscules (57 contra 48): títols en caixa alta.',
      'DAD5 és la pedra de la meitat del lector; 385 (#338855) és el verd bosc de la meitat de l’autor.',
      'L’arrel digital de la suma de dígits (94) és 4: quatre actes. N4 es repeteix a 49 i 87.',
    ],
    type: 'Bricolage Grotesque + DM Mono + Baskerville',
  },
  {
    id: 'd',
    name: 'Teixit',
    seed: 'n0jkCnJiEAEAvDlfC3DJqMs627g1Y9z45uxdFsBHRODs6FSoCRqkMKThzaAOcuyaTbdAMecMlv9MyCuomCtszOytD3hUE7OmpoZBSsYsJMWFkdHFjQ7QwXEcyTaxyEtl',
    idea: 'Trama vol dir teixit. Fosc, amb un fil coral que passa per sobre i per sota, i una graella de 14 cel·les.',
    readings: [
      'EAEA (amb AEA i EAE a dins) és una alternança pura, per sobre i per sota: ordit i trama. El títol alterna veus, paraula a paraula.',
      'Només té 14 dígits, la xifra més baixa de les quatre, com les 14 eines: 14 cel·les.',
      'L’arrel digital de 69 és 6: graella de 6 columnes.',
      'Cap caràcter doble: dues cel·les veïnes no tenen mai la mateixa mida ni el mateix to.',
      'fC3D (coral), 627 (pruna) i bdA (sàlvia) fan la paleta. Els dígits s’amunteguen entre les posicions 22 i 32 com un nus: la franja densa de dades de l’heroi.',
    ],
    type: 'Schibsted Grotesk + Newsreader cursiva',
  },
  {
    id: 'e',
    name: 'Quadern',
    seed: '',
    idea: 'La síntesi: la tipografia i els capítols d’A, la vall de B dibuixada sobre el paper quadriculat de l’app, el tauler de debò a cada capítol, la comparativa i el desenllaç dins de la pintura.',
    readings: [
      'Tipografia i logo d’A: és per a escriptors.',
      'L’heroi de B, amb la vall en V, sobre la quadrícula de l’app sense el punt central: un dibuix al quadern.',
      'Cada capítol porta un tauler real (<trama-board>, construït des de src/embed) i el que en juga el lector, amb el motor.',
      'Les funcions petites, agrupades sota cada capítol, com a B.',
      'La comparativa amb fonts i dates, i la part tècnica explicada amb un dibuix.',
    ],
    type: 'Baskervville + Raleway',
  },
] as const

export type DirectionId = (typeof DIRECTIONS)[number]['id']
