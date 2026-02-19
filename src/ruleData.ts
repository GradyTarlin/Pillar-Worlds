/**
 * Pillar Worlds Character Creation - Rule Data
 * All data is exactly as provided. No invented content.
 */

import type {
  Bloodline,
  BackstoryFragment,
  BodyOption,
  SpiritOption,
  MindOption,
  ZodiacOption,
} from './types';

export const SKILL_KEYS = ['CHA', 'INS', 'PRW', 'STL', 'STR', 'WIS'] as const;

export const HP_LABEL = 'HP — Health Points';
export const MP_LABEL = 'MP — Mana Points';

export const SKILL_NAMES: Record<(typeof SKILL_KEYS)[number], string> = {
  CHA: 'Charisma',
  INS: 'Instinct',
  PRW: 'Prowess',
  STL: 'Stealth',
  STR: 'Strength',
  WIS: 'Wisdom',
};

export const BODY_OPTIONS: BodyOption[] = [
  { id: 'body.beefy', name: 'Beefy', bonuses: { STR: 2 } },
  { id: 'body.athletic', name: 'Athletic', bonuses: { STR: 1, PRW: 1 } },
  { id: 'body.lean', name: 'Lean', bonuses: { PRW: 2 } },
];

export const SPIRIT_OPTIONS: SpiritOption[] = [
  { id: 'spirit.reserved', name: 'Reserved', bonuses: { STL: 2 } },
  { id: 'spirit.adaptable', name: 'Adaptable', bonuses: { STL: 1, CHA: 1 } },
  { id: 'spirit.outgoing', name: 'Outgoing', bonuses: { CHA: 2 } },
];

export const MIND_OPTIONS: MindOption[] = [
  { id: 'mind.patient', name: 'Patient', bonuses: { WIS: 2 } },
  { id: 'mind.clever', name: 'Clever', bonuses: { WIS: 1, INS: 1 } },
  { id: 'mind.wild', name: 'Wild', bonuses: { INS: 2 } },
];

export const ZODIAC_OPTIONS: ZodiacOption[] = [
  { id: 'zodiac.fox', name: 'Fox', bonuses: { CHA: 1 } },
  { id: 'zodiac.elk', name: 'Elk', bonuses: { INS: 1 } },
  { id: 'zodiac.tiger', name: 'Tiger', bonuses: { PRW: 1 } },
  { id: 'zodiac.serpent', name: 'Serpent', bonuses: { STL: 1 } },
  { id: 'zodiac.bear', name: 'Bear', bonuses: { STR: 1 } },
  { id: 'zodiac.owl', name: 'Owl', bonuses: { WIS: 1 } },
];

export const BLOODLINES: Bloodline[] = [
  { id: 'bloodline.human', name: 'Human', type: 'draconic', featureName: "Dragon's Legacy", featureText: 'Gain one additional skill point.' },
  { id: 'bloodline.scalari', name: 'Scalari', type: 'draconic', featureName: 'Arcane Blood', featureText: 'Whenever you lose HP, recover MP.' },
  { id: 'bloodline.homunculi', name: 'Homunculi', type: 'draconic', featureName: 'Runic Mind', featureText: 'When you succeed on a skill check against an enemy, you may gain a point of focus on them instead of recovering MP.' },
  { id: 'bloodline.gobanni', name: 'Gobanni', type: 'blessed', featureName: "Artisan's Arms", featureText: 'If you succeed on two skill checks on your turn, you gain advantage on your next skill check.' },
  { id: 'bloodline.legnai', name: 'Legnai', type: 'blessed', featureName: "Guardian's Wings", featureText: 'You can traverse two zones with each movement.' },
  { id: 'bloodline.aiagi', name: 'Aiagi', type: 'blessed', featureName: "Shepherd's Hooves", featureText: 'Whenever you move, regain 1 HP.' },
  { id: 'bloodline.vanori', name: 'Vanori', type: 'cursed', featureName: "Reaper's Shadow", featureText: 'Regain 1 extra MP whenever you deal damage to a living enemy.' },
  { id: 'bloodline.livedi', name: 'Livedi', type: 'cursed', featureName: "Trickster's Horns", featureText: 'You can make a free CHA check whenever you avoid an attack.' },
  { id: 'bloodline.ragori', name: 'Ragori', type: 'cursed', featureName: "Marauder's Spikes", featureText: 'When an enemy hits you with a melee attack, you may immediately make a melee attack against them. Once per enemy turn.' },
  { id: 'bloodline.undori', name: 'Undori', type: 'titanborn', featureName: 'Earthen Hide', featureText: 'Add your STR bonus to your HP maximum.' },
  { id: 'bloodline.boreani', name: 'Boreani', type: 'titanborn', featureName: 'Howling Winds', featureText: 'Whenever you grant an enemy disadvantage, they also take 1 magic damage.' },
  { id: 'bloodline.kaoxi', name: 'Kaöxi', type: 'titanborn', featureName: 'Eye of Aether', featureText: 'When you succeed on a skill check against an enemy, you recover +1 MP per point of focus you have on them.' },
  { id: 'bloodline.sylvani', name: 'Sylvani', type: 'cosmic', featureName: 'Lunar Stride', featureText: 'Whenever you move, regain 1 MP.' },
  { id: 'bloodline.luminari', name: 'Luminari', type: 'cosmic', featureName: 'Radiant Gaze', featureText: 'Once per turn when you succeed on an INS check against an enemy, gain advantage on your next skill check against them.' },
  { id: 'bloodline.astari', name: 'Astari', type: 'cosmic', featureName: 'Shimmering Step', featureText: 'Whenever you avoid an attack, you gain 1 MP.' },
];

export const BACKSTORY_FRAGMENTS: BackstoryFragment[] = [
  { id: 'birth.birthright', stage: 'birth', name: 'Birthright', flavourText: 'Your people have honoured your coming with a special gift.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'birth.prophecy', stage: 'birth', name: 'Prophecy', flavourText: 'You are destined to become a legend.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick'], count: 1 }] },
  { id: 'birth.astral_alignment', stage: 'birth', name: 'Astral Alignment', flavourText: 'The cosmos align to herald your birth.', grants: [{ kind: 'abilityPick', tags: ['aether'], count: 1 }] },
  { id: 'birth.full_moon', stage: 'birth', name: 'Full Moon', flavourText: 'Your birth is illuminated by the cool light of the moon.', grants: [{ kind: 'abilityPick', tags: ['nature'], count: 1 }] },
  { id: 'birth.aurora', stage: 'birth', name: 'Aurora', flavourText: 'The heavens take on a colourful glow to welcome you to the mortal world.', grants: [{ kind: 'abilityPick', tags: ['light'], count: 1 }] },
  { id: 'birth.eclipse', stage: 'birth', name: 'Eclipse', flavourText: 'The sun itself is shrouded in darkness on the day of your birth.', grants: [{ kind: 'abilityPick', tags: ['darkness'], count: 1 }] },
  { id: 'birth.ritual', stage: 'birth', name: 'Ritual', flavourText: 'You are brought to life by an arcane ritual.', grants: [{ kind: 'abilityPick', tags: ['alchemy'], count: 1 }] },
  { id: 'birth.tempest', stage: 'birth', name: 'Tempest', flavourText: 'You are born in the midst of a howling torrent.', grants: [{ kind: 'abilityPick', tags: ['energy'], count: 1 }] },
  { id: 'youth.artifact_discovery', stage: 'youth', name: 'Artifact Discovery', flavourText: 'You stumble across a forgotten artifact.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'youth.prodigy', stage: 'youth', name: 'Prodigy', flavourText: 'You demonstrate exceptional skill from a young age.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick'], count: 1 }] },
  { id: 'youth.raised_in_the_wild', stage: 'youth', name: 'Raised in the Wild', flavourText: 'You spend your youth in the deep wilderness.', grants: [{ kind: 'abilityPick', tags: ['nature'], count: 1 }] },
  { id: 'youth.visionary_dream', stage: 'youth', name: 'Visionary Dream', flavourText: 'Your dreams reveal a cosmic secret to you.', grants: [{ kind: 'abilityPick', tags: ['aether'], count: 1 }] },
  { id: 'youth.chaotic_experiment', stage: 'youth', name: 'Chaotic Experiment', flavourText: 'Your curiosity ignites an uncontrollable reaction.', grants: [{ kind: 'abilityPick', tags: ['alchemy'], count: 1 }] },
  { id: 'youth.disastrous_awakening', stage: 'youth', name: 'Disastrous Awakening', flavourText: 'The latent power within you is awakened in a devastating disaster.', grants: [{ kind: 'abilityPick', tags: ['energy'], count: 1 }] },
  { id: 'youth.ill_omen', stage: 'youth', name: 'Ill Omen', flavourText: 'A twisted event in your early life casts a dark shadow over your future.', grants: [{ kind: 'abilityPick', tags: ['darkness'], count: 1 }] },
  { id: 'youth.miracle', stage: 'youth', name: 'Miracle', flavourText: 'A moment of unbelievable good fortune marks the emergence of your radiant power.', grants: [{ kind: 'abilityPick', tags: ['light'], count: 1 }] },
  { id: 'coming.inheritance', stage: 'comingOfAge', name: 'Inheritance', flavourText: 'A valuable heirloom is passed on to you.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'coming.training', stage: 'comingOfAge', name: 'Training', flavourText: 'You learn discipline from dedicated practice.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick'], count: 1 }] },
  { id: 'coming.apprenticeship', stage: 'comingOfAge', name: 'Apprenticeship', flavourText: 'You study under a seasoned alchemist.', grants: [{ kind: 'abilityPick', tags: ['alchemy'], count: 1 }] },
  { id: 'coming.elemental_balance', stage: 'comingOfAge', name: 'Elemental Balance', flavourText: 'With a steady mind and careful concentration, you learn to channel the spark of your spirit into a roaring flame.', grants: [{ kind: 'abilityPick', tags: ['energy'], count: 1 }] },
  { id: 'coming.devotion', stage: 'comingOfAge', name: 'Devotion', flavourText: 'You pledge your life to the immortal heavens, and they shine their grace down upon you.', grants: [{ kind: 'abilityPick', tags: ['light'], count: 1 }] },
  { id: 'coming.curse', stage: 'comingOfAge', name: 'Curse', flavourText: 'A spiteful being of dark sorcery corrupts your spirit.', grants: [{ kind: 'abilityPick', tags: ['darkness'], count: 1 }] },
  { id: 'coming.fae_encounter', stage: 'comingOfAge', name: 'Fae Encounter', flavourText: 'You chance upon a spirit of the wild whose fae presence bonds you with the land.', grants: [{ kind: 'abilityPick', tags: ['nature'], count: 1 }] },
  { id: 'coming.cosmic_journey', stage: 'comingOfAge', name: 'Cosmic Journey', flavourText: 'You pass through a portal into a different realm and witness the breadth of the cosmos.', grants: [{ kind: 'abilityPick', tags: ['aether'], count: 1 }] },
];

export const BIRTH_FRAGMENTS = BACKSTORY_FRAGMENTS.filter((f) => f.stage === 'birth');
export const YOUTH_FRAGMENTS = BACKSTORY_FRAGMENTS.filter((f) => f.stage === 'youth');
export const COMING_OF_AGE_FRAGMENTS = BACKSTORY_FRAGMENTS.filter((f) => f.stage === 'comingOfAge');
