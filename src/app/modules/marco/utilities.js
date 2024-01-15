export function getJoinFromProbabilities(customProbabilities) {
  const random = Math.floor(Math.random() * 100)
  let last = 0
  let destiny

  for (let answer of customProbabilities) {
    const max = answer.probability + last
    answer.range = [last, max]

    if (random >= last && random < max) {
      destiny = answer.node
    }
    last = max
  }

  return destiny
}

export function getJoinRandom(answerJoins) {
  const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
  return answerJoins[randomJoinIndex]
}

export function checkErrorsInProbabilities(probabilities) {
  const totalProb = probabilities
    .map((join) => join.probability)
    .reduce((total, actual) => total + actual)

  if (totalProb === 100) {
    return true
  }
  if (totalProb != 100) {
    console.error(
      'In a random join with custom probabilities, probabilities must sume 100(%)'
    )
  }
  if (probabilities.length != answer.join.length) {
    console.error(
      'In a random join with custom probabilities, all the destinies must have a probability'
    )
  }
  console.error('There is some problem with the probabilities')

  return false
}

export function hasRequirements(player, requirements) {

  if (!requirements) {
    return true
  }

  for (let requirement of requirements) {
    if (requirement.type === 'stat') {

      // Si el jugador no té stats, directament fora
      if (player.stats.length === 0) return false

      // Si té stats però cap és l'id que ens interessa, res
      const playerHasSomeRequiredStats = player.stats.some(stat => stat.id === requirement.id)
      if (!playerHasSomeRequiredStats) return false

      // Si arriba aqui, entenem que hi ha un o més estats que ens interessen
      // Si algun d'aquets és fals, hem de retornar false. Busquem si n'hi ha algun
      const someUnsatisfiedStat = player.stats.some(stat => stat.amount < requirement.amount)
      if (someUnsatisfiedStat) return false

    }
    if (requirement.type === 'condition') {

      const conditionIsRequired = requirement.amount === 1

      // Si la condició és requerida (1) i el jugador no la té, fora
      if (conditionIsRequired && player.conditions.length === 0) {
        return false
      }

      const playerHasSomeRequiredConditions = player.conditions.some(condition => condition.id === requirement.id)
      // Si la condicio es requerida pero no en tenim ni una, estem fora
      if (conditionIsRequired && !playerHasSomeRequiredConditions) {
        return false
      }

      // Si arriba aqui, entenem que hi ha una o més condicions que ens interessen
      // Ara ens trobem amb condicions que tenen 0 o 1
      // Aqui hauria de fer un for o algo perque aixo no xuta
      for (let condition of player.conditions) {
        if (condition.id === requirement.id) {
          // Si es el que busquem, checkeguem
          if (!conditionIsRequired) {
            // Si la condicio havia de ser negada, pos al tenirla hem de tornar false
            return false
          }
        }
      }
    }
  }
  return true
}
