import { MissingRequirement, Scene, SceneAnswer, Story, Visit } from '@trama-app/engine'
import { node, node_answer } from 'src/app/core/interfaces/interfaces'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { PlayableAnswer, PlayableNode } from './game-session.types'

/** Maps a scene computed by @trama-app/engine to the shape the player views render. */
export function sceneToPlayableNode(
  scene: Scene, stored: node, i18n: I18nService,
  visit: Partial<Pick<PlayableNode, 'key' | 'selectedAnswerId' | 'userResponse'>> = {}
): PlayableNode {
  const storedAnswers = new Map((stored.answers ?? []).map(answer => [answer.id, answer]))
  return {
    ...stored,
    text: scene.text,
    answers: scene.answers.map(answer => toPlayableAnswer(answer, storedAnswers.get(answer.id), i18n)),
    jumpToAnswers: scene.skipText,
    ...visit,
  }
}

/** A recorded visit as the player views render it. */
export function visitToPlayableNode(visit: Visit, story: Story, i18n: I18nService): PlayableNode {
  // The engine only records visits of nodes that existed when they were reached;
  // an edited story may have removed one since, so fall back to the recorded scene.
  const stored = (story.node(visit.nodeId) ?? { id: visit.nodeId, type: visit.scene.type, top: 0, left: 0 }) as node
  return sceneToPlayableNode(visit.scene, stored, i18n, {
    key: visit.id, selectedAnswerId: visit.selectedAnswerId, userResponse: visit.userResponse,
  })
}

function toPlayableAnswer(answer: SceneAnswer, stored: node_answer | undefined, i18n: I18nService): PlayableAnswer {
  return {
    ...stored,
    id: answer.id,
    text: answer.text,
    locked: answer.locked,
    missingRequirements: answer.locked && answer.display === 'requirements'
      ? answer.missing.map(requirement => describeRequirement(requirement, i18n))
      : [],
  }
}

function describeRequirement(requirement: MissingRequirement, i18n: I18nService): string {
  const { name, required: amount, current } = requirement
  // Never expose internal IDs for deleted or malformed references.
  if (!name || !Number.isFinite(amount)) return i18n.t('common.answerDisplay.unknown')
  if (requirement.type === 'stat') return i18n.t('common.answerDisplay.stat', { name, amount, current })
  return i18n.t(amount === 1 ? 'common.answerDisplay.condition' : 'common.answerDisplay.absentCondition', { name })
}
