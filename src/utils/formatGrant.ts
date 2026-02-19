import type { Grant } from '../types';

export function formatGrantCasual(grant: Grant): string {
  const n = grant.count;
  const num = n === 1 ? 'one' : n;

  switch (grant.kind) {
    case 'equipmentPick':
      return `Choose ${num} piece${n === 1 ? '' : 's'} of equipment`;
    case 'masteryPick':
      if (grant.tags?.length) {
        const tagList =
          grant.tags.length > 1
            ? grant.tags.slice(0, -1).join(', ') + ' or ' + grant.tags[grant.tags.length - 1]
            : grant.tags[0];
        return `Choose ${num} ${tagList} mastery`;
      }
      return `Choose ${num} mastery`;
    case 'abilityPick':
      if (grant.tags?.length) {
        const tag = grant.tags[0];
        return `Choose ${num} ${tag} ability`;
      }
      return `Choose ${num} ability`;
    default:
      return `${grant.kind} × ${grant.count}`;
  }
}
