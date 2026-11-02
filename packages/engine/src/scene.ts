import { answerDisplay } from './story'
import { meetsRequirements, missingRequirements } from './rules'
import { inlineHtml, interpolate, plainText } from './text'
import { PlayerState, Scene, SceneAnswer, Story, StoryJoin } from './types'

export const DEFAULT_IMAGE_URL = 'https://lsemostpqoguehpsbzgu.supabase.co/storage/v1/object/public/images/'

export interface RenderOptions {
  /** Resolves image paths. Defaults to Trama's public image storage. */
  imageUrl?: (path: string) => string
}

/**
 * What the player sees at a node for a given state, without running events or
 * moving the game. Useful to refresh a visit after the story was edited.
 * Returns undefined for missing nodes and distributors, which are never shown.
 */
export function renderScene(
  story: Story, nodeId: string, entry: StoryJoin, player: PlayerState, options: RenderOptions = {}
): Scene | undefined {
  const node = story.node(nodeId)
  if (!node || node.type === 'distributor') return undefined
  const imageUrl = options.imageUrl ?? (path => DEFAULT_IMAGE_URL + path)

  const answers = (node.answers ?? []).flatMap((answer): SceneAnswer[] => {
    // Unfinished answers stay visible while they have text; empty placeholders do not.
    if (!answer.join?.length && !plainText(answer.text).trim()) return []
    const locked = !meetsRequirements(player, answer.requirements)
    const display = answerDisplay(answer.unavailableAnswerDisplay ?? story.unavailableAnswerDisplay)
    if (locked && display === 'hidden') return []
    return [{
      id: answer.id,
      text: inlineHtml(interpolate(answer.text, story, player)),
      connected: !!answer.join?.length,
      locked,
      display: display === 'hidden' ? 'locked' : display,
      missing: locked ? missingRequirements(story, player, answer.requirements) : [],
    }]
  })
  const type = node.type === 'text' || node.type === 'end' ? node.type : 'content'
  return {
    nodeId: node.id,
    type,
    ...(node.name ? { name: node.name } : {}),
    text: interpolate(node.text, story, player),
    // Jumping to answers must not leave the player with a blank node.
    skipText: !!entry.toAnswer && answers.length > 0,
    ...(node.image?.path ? { image: { path: node.image.path, url: imageUrl(node.image.path) } } : {}),
    answers,
    ...(type === 'text' && node.userTextOptions ? { input: { ...node.userTextOptions } } : {}),
    links: structuredClone(node.links ?? []),
    ...(node.share ? { share: { ...node.share } } : {}),
  }
}
