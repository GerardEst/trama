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

  if (!requirements) return true

  // If just some of the requirements is not met, we can throw false and stop checking
  for (let requirement of requirements) {
    if (requirement.type === 'stat') {

      if (player.stats.length === 0) return false

      const playerHasSomeRequiredStats = player.stats.some(stat => stat.id === requirement.id)
      if (!playerHasSomeRequiredStats) return false

      const someUnsatisfiedStat = player.stats.some(stat => stat.amount < requirement.amount)
      if (someUnsatisfiedStat) return false
    }
    if (requirement.type === 'condition') {

      // In conditions, the requirement might be that the condition is not checked
      const conditionIsRequired = requirement.amount === 1

      // If condition should be checked but player doesn't have any conditions
      if (conditionIsRequired && player.conditions.length === 0) return false

      // If condition should be checked but player doesn't have this condition
      const playerHasSomeRequiredConditions = player.conditions.some(condition => condition.id === requirement.id)
      if (conditionIsRequired && !playerHasSomeRequiredConditions) return false

      for (let condition of player.conditions) {
        // If player has the condition, but it should not be checked
        if (condition.id === requirement.id && !conditionIsRequired) return false
      }
    }
  }
  return true
}
