import { answer_requirement, condition, join, player, stat } from "./interfaces"

export function getJoinRandom(answerJoins:Array<join>) {
  const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
  return answerJoins[randomJoinIndex]
}

export function playerHasAnswerRequirements(player:player, requirements:Array<answer_requirement>) {

  if (!requirements) return true

  // If just some of the requirements is not met, we can throw false and stop checking
  for (let requirement of requirements) {
    let requirement_amount = requirement.amount
    if (requirement.type === 'stat') {

      if (player.stats.length === 0) return false

      const playerHasSomeRequiredStats = player.stats.some((stat:stat) => stat.id === requirement.id)
      if (!playerHasSomeRequiredStats) return false

      const someUnsatisfiedStat = player.stats.some((stat:stat) => stat.amount < requirement_amount)
      if (someUnsatisfiedStat) return false
    }
    if (requirement.type === 'condition') {

      // In conditions, the requirement might be that the condition is not checked
      const conditionIsRequired = requirement_amount === 1

      // If condition should be checked but player doesn't have any conditions
      if (conditionIsRequired && player.conditions.length === 0) return false

      // If condition should be checked but player doesn't have this condition
      const playerHasSomeRequiredConditions = player.conditions.some((condition:condition) => condition.id === requirement.id)
      if (conditionIsRequired && !playerHasSomeRequiredConditions) return false

      for (let condition of player.conditions) {
        // If player has the condition, but it should not be checked
        if (condition.id === requirement.id && !conditionIsRequired) return false
      }
    }
  }
  return true
}

export const normalizeLink = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}
