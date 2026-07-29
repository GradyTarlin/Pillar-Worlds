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
import aiagiArt from './assets/bloodlines/aiagi.png';
import gobanniArt from './assets/bloodlines/gobanni.png';
import legnaiArt from './assets/bloodlines/legnai.png';
import livediArt from './assets/bloodlines/livedi.png';
import ragoriArt from './assets/bloodlines/ragori.png';
import vanoriArt from './assets/bloodlines/vanori.png';

export const SKILL_KEYS = ['CHA', 'INS', 'PRW', 'STL', 'STR', 'WIS'] as const;

export const HP_LABEL = 'HP Maximum';
export const MP_LABEL = 'MP Maximum';
export const MP_RECOVERY_LABEL = 'MP Recovery';

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
  {
    id: 'bloodline.human',
    name: 'Human',
    type: 'draconic',
    description: "The first bloodline born from the arcane influence of dragon's blood, humans were also the first mortal beings to wield magic. Their vast empires once ruled all of the pillar worlds in the nebulous era before the ascension of the gods, echoes of which can still be found in lost ruins. Humans remain the most populous of all bloodlines, forming diverse societies across the pillar worlds.",
    featureName: "Dragon's Legacy",
    featureDescription: 'The potential for greatness smoulders within you.',
    featureText: 'Gain one additional skill point.',
  },
  {
    id: 'bloodline.scalari',
    name: 'Scalari',
    type: 'draconic',
    description: "When a human is submerged in magical dragon's blood, they are usually consumed by the immense mana contained within. The select few who survive such a ritual are reborn as Scalari, semi-draconic humanoids who enjoy many of the same gifts as dragons. Large, powerful, and imposing, Scalari are often feared or revered by other mortals.",
    featureName: 'Arcane Blood',
    featureDescription: 'The dragonblood which courses through your veins is the source of all arcane magic, charging the air with mana when it is spilled.',
    featureText: 'Whenever you lose HP, recover MP.',
  },
  {
    id: 'bloodline.homunculi',
    name: 'Homunculi',
    type: 'draconic',
    description: "Inorganic humanoids first crafted by human alchemists, homunculi are considered by many to be an affront against the natural cycle of birth, death, and reincarnation. Meticulously built piece-by-piece, homunculi are powered by enchanted crystal hearts doused in dragon's blood. Often consigned to a life of servitude, homunculi can become incredibly powerful if freed from the control of their creator.",
    featureName: 'Runic Mind',
    featureDescription: 'Your mind is encoded in tightly bound scrolls.',
    featureText: 'When you succeed on a skill check against an enemy, you may gain a point of focus on them instead of recovering MP.',
  },
  {
    id: 'bloodline.gobanni',
    name: 'Gobanni',
    type: 'blessed',
    imageUrl: gobanniArt,
    description: 'Descended from the gods of craft, Gobanni are four-armed artisans who excel in all forms of craftsmanship. When they are able to pursue their crafts in peace, Gobanni tend to have a jolly and affable disposition. They do not generally gravitate towards violence but can be extremely dangerous warriors if they are given cause to fight.',
    featureName: "Artisan's Arms",
    featureDescription: 'You are blessed with an extra pair of arms, which help you wield the tools of your trade.',
    featureText: 'If you succeed on two skill checks on your turn, you gain advantage on your next skill check.',
  },
  {
    id: 'bloodline.legnai',
    name: 'Legnai',
    type: 'blessed',
    imageUrl: legnaiArt,
    description: 'Descended from the gods of honour, Legnai are angelic humanoids gifted with powerful wings and an innate sense for the truth. Legnai often devote their lives to the pursuit of justice, hunting down the wicked and avenging those they have wronged. Though they are widely regarded as paragons of virtue, Legnai are known to have an inflexible view of morality that can lead to severe judgments even for those who are driven to crime out of desperation.',
    featureName: "Guardian's Wings",
    featureDescription: 'Feathered wings emerge from your back, granting you speed and grace.',
    featureText: 'You can traverse two zones with each movement.',
  },
  {
    id: 'bloodline.aiagi',
    name: 'Aiagi',
    type: 'blessed',
    imageUrl: aiagiArt,
    description: 'Descended from the gods of love, Aiagi are joyous humanoids with branch-like antlers and cloven hooves. They nourish growth and fertility wherever they go, nurturing personal bonds and working towards harmony among all living things. Despite their cheerful disposition, Aiaigi will fight fiercely against forces of corruption and division.',
    featureName: "Shepherd's Hooves",
    featureDescription: 'Wherever you step, life flourishes.',
    featureText: 'Whenever you move, regain 1 HP.',
  },
  {
    id: 'bloodline.vanori',
    name: 'Vanori',
    type: 'cursed',
    imageUrl: vanoriArt,
    description: 'Descended from the gods of time, Vanori are cursed to feed on death. Typically sporting long dark hair and gaunt features, Vanori do not experience linear aging like most bloodlines. They wither in times of prosperity and are revitalized in times of hardship, leading many to believe that Vanori cause crises themselves to feed upon mortal suffering.',
    featureName: "Reaper's Shadow",
    featureDescription: 'The gloom which surrounds you drinks greedily from living spirits, replenishing your own shadowy essence.',
    featureText: 'Regain 1 extra MP whenever you deal damage to a living enemy.',
  },
  {
    id: 'bloodline.livedi',
    name: 'Livedi',
    type: 'cursed',
    imageUrl: livediArt,
    description: 'Descended from the gods of trickery, Livedi have curved horns and long, nimble tails. They revel in mischief of all kinds, turning loved ones against each other and exploiting ignorance for personal gain. Livedi often live nomadic lives as they tend to be driven out of communities once people begin to catch on to their schemes.',
    featureName: "Trickster's Horns",
    featureDescription: 'A pair of curled horns magnifies your influence over the minds of others.',
    featureText: 'You can make a free CHA check whenever you avoid an attack.',
  },
  {
    id: 'bloodline.ragori',
    name: 'Ragori',
    type: 'cursed',
    imageUrl: ragoriArt,
    description: 'Descended from the gods of war, Ragori have sharp bony protrusions jutting out from the edges of their bodies. They thirst for blood, and take on the traits of the species they feed on. Ragori can blend in with humans after gorging on human blood, but they can turn into all sorts of monsters depending on their diet. Ragori who drank the blood of goblins became the first orcs, and those who fed on the blood of Vanori became the first vampires.',
    featureName: "Marauder's Spikes",
    featureDescription: 'Bony spikes jut from the edges of your body, threatening to impale anyone who challenges you.',
    featureText: 'When an enemy hits you with a melee attack, you may immediately make a melee attack against them. You can do this once per enemy turn.',
  },
  {
    id: 'bloodline.undori',
    name: 'Undori',
    type: 'titanborn',
    description: 'Children of Proak, titan of the land, the Undori have stony skin and hearts of burbling magma. Sturdy and tough, the Undori often spend their lives underground mining and crafting astounding creations from gems and stone. Though the subterranean Undori tend to remain short and stocky, those who live above ground can take on the stature of the mountains, growing tall and mighty.',
    featureName: 'Earthen Hide',
    featureDescription: 'Your stony skin is not easily harmed.',
    featureText: 'Add your STR bonus to your HP maximum.',
  },
  {
    id: 'bloodline.boreani',
    name: 'Boreani',
    type: 'titanborn',
    description: 'Children of Vugol, titan of the skies, the Boreani are light as a cloud and as fast as a gale wind. With endless breath coming from within, the Boreani gather in choirs of incredible beauty. While many Boreani live high up in the treetops, many others spend their lives traversing the seas.',
    featureName: 'Howling Winds',
    featureDescription: 'Your voice carries on gale winds, a warning to those who would oppose you.',
    featureText: 'Whenever you grant an enemy disadvantage, they also take 1 magic damage.',
  },
  {
    id: 'bloodline.kaoxi',
    name: 'Kaöxi',
    type: 'titanborn',
    description: 'Children of Arxis, titan of the Maelstrom, the Kaöxi resonate with latent magical energy. They are born with magic ring patterns on their foreheads through which they can sense currents of mana flowing through the aether. Kaöxi often spend their lives in quiet contemplation, attuning themselves to the currents of magic that flow through reality.',
    featureName: 'Eye of Aether',
    featureDescription: 'Swirling aether sits upon your brow, feeding you knowledge from beyond the mortal realm.',
    featureText: 'When you succeed on a skill check against an enemy, you recover +1 MP per point of focus you have on them.',
  },
  {
    id: 'bloodline.sylvani',
    name: 'Sylvani',
    type: 'cosmic',
    description: 'While most fairies leave Eden to incarnate as mortals on the pillar worlds, some choose to stay in their fae home and mature into Sylvani. Sylvani are lithe, graceful humanoids who develop animalistic abilities from basking in the light of the moon. Sylvani make excellent hunters and scouts, navigating wilderness environments with unparalleled speed and precision.',
    featureName: 'Lunar Stride',
    featureDescription: 'Moonlight illuminates your steps, basking you in its silver glow.',
    featureText: 'Whenever you move, regain 1 MP.',
  },
  {
    id: 'bloodline.luminari',
    name: 'Luminari',
    type: 'cosmic',
    description: 'While most mortal souls are claimed by the gods, sometimes the sun allows exceptional souls to be reincarnated immediately as Luminari. Free-spirited humanoids with gleaming golden eyes and glowing hair, Luminari overflow with energy. A happy Luminari can literally light up a room with the warm light of their joy, but an angry one can burn down a building with their fiery wrath.',
    featureName: 'Radiant Gaze',
    featureDescription: 'The sun’s radiance spills forth from your eyes, casting all that you see in golden warmth.',
    featureText: 'Once per turn when you succeed on an INS check against an enemy, gain advantage on your next skill check against them.',
  },
  {
    id: 'bloodline.astari',
    name: 'Astari',
    type: 'cosmic',
    description: 'Enigmatic humanoids with dark, glittering eyes, Astari are said to be the children of the stars. Very little is known about the mysterious Astari, but it is believed that they are born when a shooting star falls upon the land. Exceptionally elusive and adept with magic, people attribute all manner of strange phenomena to the workings of Astari.',
    featureName: 'Shimmering Step',
    featureDescription: 'Your form glimmers and bends as you stay one step ahead of your enemy.',
    featureText: 'Whenever you avoid an attack, you gain 1 MP.',
  },
];

export const BACKSTORY_FRAGMENTS: BackstoryFragment[] = [
  { id: 'birth.birthright', stage: 'birth', name: 'Birthright', flavourText: 'Your people have honoured your coming with a special gift.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'birth.prophecy', stage: 'birth', name: 'Prophecy', flavourText: 'You are destined to become a legend.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick', 'defense'], count: 1 }] },
  { id: 'birth.astral_alignment', stage: 'birth', name: 'Astral Alignment', flavourText: 'The cosmos align to herald your birth.', grants: [{ kind: 'abilityPick', tags: ['aether'], count: 1 }] },
  { id: 'birth.full_moon', stage: 'birth', name: 'Full Moon', flavourText: 'Your birth is illuminated by the cool light of the moon.', grants: [{ kind: 'abilityPick', tags: ['nature'], count: 1 }] },
  { id: 'birth.aurora', stage: 'birth', name: 'Aurora', flavourText: 'The heavens take on a colourful glow to welcome you to the mortal world.', grants: [{ kind: 'abilityPick', tags: ['light'], count: 1 }] },
  { id: 'birth.eclipse', stage: 'birth', name: 'Eclipse', flavourText: 'The sun itself is shrouded in darkness on the day of your birth.', grants: [{ kind: 'abilityPick', tags: ['darkness'], count: 1 }] },
  { id: 'birth.ritual', stage: 'birth', name: 'Ritual', flavourText: 'You are brought to life by an arcane ritual.', grants: [{ kind: 'abilityPick', tags: ['alchemy'], count: 1 }] },
  { id: 'birth.tempest', stage: 'birth', name: 'Tempest', flavourText: 'You are born in the midst of a howling torrent.', grants: [{ kind: 'abilityPick', tags: ['energy'], count: 1 }] },
  { id: 'youth.artifact_discovery', stage: 'youth', name: 'Artifact Discovery', flavourText: 'You stumble across a forgotten artifact.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'youth.prodigy', stage: 'youth', name: 'Prodigy', flavourText: 'You demonstrate exceptional skill from a young age.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick', 'defense'], count: 1 }] },
  { id: 'youth.raised_in_the_wild', stage: 'youth', name: 'Raised in the Wild', flavourText: 'You spend your youth in the deep wilderness.', grants: [{ kind: 'abilityPick', tags: ['nature'], count: 1 }] },
  { id: 'youth.visionary_dream', stage: 'youth', name: 'Visionary Dream', flavourText: 'Your dreams reveal a cosmic secret to you.', grants: [{ kind: 'abilityPick', tags: ['aether'], count: 1 }] },
  { id: 'youth.chaotic_experiment', stage: 'youth', name: 'Chaotic Experiment', flavourText: 'Your curiosity ignites an uncontrollable reaction.', grants: [{ kind: 'abilityPick', tags: ['alchemy'], count: 1 }] },
  { id: 'youth.disastrous_awakening', stage: 'youth', name: 'Disastrous Awakening', flavourText: 'The latent power within you is awakened in a devastating disaster.', grants: [{ kind: 'abilityPick', tags: ['energy'], count: 1 }] },
  { id: 'youth.ill_omen', stage: 'youth', name: 'Ill Omen', flavourText: 'A twisted event in your early life casts a dark shadow over your future.', grants: [{ kind: 'abilityPick', tags: ['darkness'], count: 1 }] },
  { id: 'youth.miracle', stage: 'youth', name: 'Miracle', flavourText: 'A moment of unbelievable good fortune marks the emergence of your radiant power.', grants: [{ kind: 'abilityPick', tags: ['light'], count: 1 }] },
  { id: 'coming.inheritance', stage: 'comingOfAge', name: 'Inheritance', flavourText: 'A valuable heirloom is passed on to you.', grants: [{ kind: 'equipmentPick', count: 1 }] },
  { id: 'coming.training', stage: 'comingOfAge', name: 'Training', flavourText: 'You learn discipline from dedicated practice.', grants: [{ kind: 'masteryPick', tags: ['weapon', 'relic', 'trick', 'defense'], count: 1 }] },
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
