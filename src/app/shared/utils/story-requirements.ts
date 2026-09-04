import { answer_requirement } from 'src/app/core/interfaces/interfaces'

/** Returns the reference id used by both current and legacy requirements. */
export function getRequirementRefId(
  requirement: answer_requirement
): string | undefined {
  return requirement.target || requirement.id
}
