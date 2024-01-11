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

export function hasRequirements(hero, requirements) {
  let checkedRequirements = {
    stats: [],
    conditions: [],
  }
  let availableAnswer = true

  if (!requirements)
    return {
      availableAnswer: true,
      checkedRequirements: 'Answer with 0 requirements',
    }

  for (let requirement of requirements) {
    if (requirement.type === 'stat') {
      checkedRequirements.stats.push(requirement)
      if (hero.stats && hero.stats.length > 0) {
        for (let heroStat of hero.stats) {
          if (
            requirement.id === heroStat.id &&
            requirement.amount <= heroStat.amount
          ) {
            checkedRequirements.stats.slice(-1)[0].available = true
            break
          } else {
            checkedRequirements.stats.slice(-1)[0].available = false
          }
        }
        if (availableAnswer)
          availableAnswer = checkedRequirements.stats.slice(-1)[0].available
      } else {
        checkedRequirements.stats.slice(-1)[0].available = false
        availableAnswer = false
      }
    }

    if (requirement.type === 'condition') {
      checkedRequirements.conditions.push(requirement)
      if (hero.conditions && hero.conditions.length > 0) {
        for (let heroCondition of hero.conditions) {
          if (requirement.id === heroCondition.id) {
            checkedRequirements.conditions.slice(-1)[0].available =
              requirement.amount === '0' ? false : true
            break
          } else {
            checkedRequirements.conditions.slice(-1)[0].available =
              requirement.amount === '0' ? true : false
          }
        }
        if (availableAnswer)
          availableAnswer =
            checkedRequirements.conditions.slice(-1)[0].available
      } else {
        if (requirement.amount === '0') {
          checkedRequirements.conditions.slice(-1)[0].available = true
        } else {
          checkedRequirements.conditions.slice(-1)[0].available = false
          availableAnswer = false
        }
      }
    }
  }

  return { availableAnswer, checkedRequirements }
}
