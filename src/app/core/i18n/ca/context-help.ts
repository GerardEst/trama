export const contextHelp = {
  preference: 'Mostrar ajuda contextual',
  explain: 'Ajuda: {topic}',
  documentation: 'Veure-ho a la documentació',
  newTab: 'S’obre en una pestanya nova',
  topics: {
    entryPoint: {
      body: 'Inici indica on comença l’aventura. No és una escena ni es mostra al jugador: arrossega el connector fins al node que vols executar primer. Pots canviar aquesta connexió en qualsevol moment. Si queda desconnectat, no es pot iniciar la partida.',
    },
    contentNode: {
      body: 'Un node de contingut és una escena de la teva història. Escriu el passatge que llegirà el jugador i afegeix respostes perquè pugui triar què passa després. Connecta cada resposta amb un altre node per crear camins diferents. Si no hi ha respostes, pots connectar el node directament amb l’escena següent.',
    },
    textNode: {
      body: 'Aquest node fa una pregunta oberta al jugador i desa el text que escriu en una propietat de la partida. Indica quina propietat vols fer servir, com ara nom, i connecta el node amb l’escena següent. Més endavant pots inserir la resposta al text de la història amb una variable.',
    },
    distributorNode: {
      body: 'Aquest node tria automàticament el camí següent sense mostrar una escena al jugador. Comprova les rutes en ordre segons estadístiques o condicions i segueix la primera que es compleix. Connecta la sortida En cas contrari per als casos que no compleixin cap ruta.',
    },
    endNode: {
      body: 'Aquest node marca el final d’un camí de la història i mostra el passatge de comiat al jugador. Pots crear finals diferents segons les decisions preses. També pots configurar opcions per compartir la història i, amb una subscripció de pagament, afegir enllaços externs.',
    },
    events: {
      title: 'Esdeveniments',
      body: 'Els esdeveniments canvien l’estat del jugador quan es juga un passatge o una resposta. Poden sumar o restar una estadística, activar o desactivar una condició, o establir una propietat de text. Per exemple, una resposta pot donar una clau al jugador perquè la faci servir més endavant.',
    },
    requirements: {
      title: 'Requisits',
      body: 'Els requisits determinen si una resposta està disponible per al jugador. Pots exigir un valor mínim d’una estadística o que una condició estigui activa o inactiva. S’han de complir tots els requisits. Per exemple, una porta només es pot obrir si el jugador té una clau.',
    },
    references: {
      title: 'Estadístiques, condicions i propietats',
      body: 'Són els valors que la història recorda sobre el jugador. Les estadístiques contenen quantitats, com ara monedes; les condicions estan actives o inactives, com ara tenir una clau; les propietats contenen text, com ara un nom. Reutilitza la mateixa referència en esdeveniments i comprovacions per connectar diferents parts de la història.',
    },
  },
}
