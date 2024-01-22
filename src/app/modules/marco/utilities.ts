export function getJoinFromProbabilities(customProbabilities:any) {
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

export function getJoinRandom(answerJoins:any) {
  const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
  return answerJoins[randomJoinIndex]
}

// ref -> tot aixo es pot treure probablement
export function checkErrorsInProbabilities(probabilities:any) {
  const totalProb = probabilities
    .map((join:any) => join.probability)
    .reduce((total:any, actual:any) => total + actual)

  if (totalProb === 100) {
    return true
  }
  console.error('There is some problem with the probabilities')

  return false
}

export function hasRequirements(player:any, requirements:any) {

  if (!requirements) return true

  // If just some of the requirements is not met, we can throw false and stop checking
  for (let requirement of requirements) {
    if (requirement.type === 'stat') {

      if (player.stats.length === 0) return false

      const playerHasSomeRequiredStats = player.stats.some((stat:any) => stat.id === requirement.id)
      if (!playerHasSomeRequiredStats) return false

      const someUnsatisfiedStat = player.stats.some((stat:any) => stat.amount < requirement.amount)
      if (someUnsatisfiedStat) return false
    }
    if (requirement.type === 'condition') {

      // In conditions, the requirement might be that the condition is not checked
      const conditionIsRequired = requirement.amount === 1

      // If condition should be checked but player doesn't have any conditions
      if (conditionIsRequired && player.conditions.length === 0) return false

      // If condition should be checked but player doesn't have this condition
      const playerHasSomeRequiredConditions = player.conditions.some((condition:any) => condition.id === requirement.id)
      if (conditionIsRequired && !playerHasSomeRequiredConditions) return false

      for (let condition of player.conditions) {
        // If player has the condition, but it should not be checked
        if (condition.id === requirement.id && !conditionIsRequired) return false
      }
    }
  }
  return true
}
