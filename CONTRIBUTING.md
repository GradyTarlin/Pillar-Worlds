# Contributing Game Content

This guide covers the repository's current conventions for adding monsters,
playable bloodlines (called "races" in some product language), and artwork.

## Add a Monster

Monster content is defined in `src/data/monsters/monsterData.json`. Its
TypeScript model is `Monster` in `src/data/monsters/types.ts`, and
`src/data/monsters/index.ts` exports the collections and lookup helpers used by
the UI.

Add a complete entry to the JSON `monsters` array:

```json
{
  "id": "monster.beasts.example_beast",
  "name": "Example Beast",
  "monsterType": "Beasts",
  "level": 3,
  "hpMax": 8,
  "armourMax": 0,
  "wardMax": 0,
  "traits": ["fast"],
  "skills": { "STR": 2, "PRW": 1 },
  "abilities": [],
  "equipment": [],
  "loreText": "Canonical lore text.",
  "notes": []
}
```

All fields shown above are required. Skill keys are limited to `STR`, `PRW`,
`INS`, `WIS`, `STL`, and `CHA`. Equipment entries require `name` and
`rulesText`.

- `monsterType` must exactly match an entry in the JSON `monsterTypes` array.
  Add a new type there only when introducing a new category.
- Trait strings must match IDs in `monsterTraitDefinitions`. A new trait needs
  an `id`, a category (`offensive`, `survivability`, `magic`, or `trickery`),
  and `rulesText`.
- Ability strings must match IDs in `monsterAbilities`. A new ability needs an
  `id`, `name`, `check` (`null` or a supported check object), and `rulesText`.
- Use unique, stable IDs. Existing conventions are
  `monster.<type>.<slug>` and
  `monAbility.<type>.<monster>.<slug>`.

Do not rename a released monster ID. Campaign `CampaignMonster.monsterId` and
encounter `EncounterCombatant.entityId` values retain that catalog ID.

Monster data automatically appears in:

- `src/pages/MonsterListPage.tsx` and
  `src/components/MonsterDetailPanel.tsx`
- `src/pages/campaign/MonstersView.tsx`
- `src/pages/campaign/EncountersView.tsx`
- Saved campaign monster and encounter displays in
  `src/pages/campaign/UnifiedMap.tsx`

Check bestiary details and type filtering, dungeon base-monster selection, and
encounter type/level filtering, HP initialization, and detail lookup. The
`dragonBloodlines` collection in the monster JSON is reference data for
monsters; it is not the playable bloodline catalog.

## Add a Playable Bloodline

The canonical collection is `BLOODLINES` in `src/ruleData.ts`. `Bloodline` and
`BloodlineType` are defined in `src/types.ts`.

```ts
{
  id: 'bloodline.example',
  name: 'Example',
  type: 'cosmic',
  featureName: 'Example Feature',
  featureDescription: 'Optional canonical flavor text.',
  featureText: 'Canonical mechanical rules text.',
  description: 'Optional canonical bloodline description.',
  imageUrl: exampleArt, // Optional Vite asset URL.
}
```

Required fields are `id`, `name`, `type`, `featureName`, and `featureText`.
`featureDescription`, `description`, and `imageUrl` are optional. Current
types are `draconic`, `blessed`, `cursed`, `titanborn`, and `cosmic`; update
the `BloodlineType` union before using a genuinely new category.

Use a unique, stable `bloodline.<slug>` ID because saved and campaign
characters reference it. Feature text does not implement mechanics
automatically. For example, `bloodline.human` has explicit extra-skill logic
in `src/pages/CharacterCreationPage.tsx` and `src/derivation.ts`, while
`bloodline.undori` has explicit HP logic in `src/derivation.ts`. Add similarly
targeted logic for any new mechanical exception.

New `BLOODLINES` entries automatically reach:

- `src/components/BloodlineCarousel.tsx` and
  `src/pages/CharacterCreationPage.tsx`
- `src/pages/CharactersPage.tsx` and
  `src/components/CharacterSheet.tsx`
- `src/pages/campaign/CharactersView.tsx`

`src/pages/campaign/SocialNetworkView.tsx` intentionally defaults generated
campaign characters to Human; a normal new bloodline does not require changing
that default.

## Add Artwork

### Bloodline Artwork

Copy the original image without re-encoding to
`src/assets/bloodlines/<stable-slug>.png`. Import it in `src/ruleData.ts` and
assign it to the intended bloodline record:

```ts
import exampleArt from './assets/bloodlines/example.png';

// In the matching BLOODLINES entry:
imageUrl: exampleArt,
```

Bind artwork to the explicit record, never to an array position. Vite
fingerprints and emits imported asset URLs. `BloodlineCarousel.tsx` provides
alt text, stable portrait cropping, and a labeled fallback when artwork is
missing or fails to load.

### Monster Artwork

Monster artwork is not currently supported. `Monster` has no image field,
`monsterData.json` has no image property, and `MonsterDetailPanel.tsx` does not
render art. Do not add an ad hoc JSON property.

A future monster-art feature should first add a typed representation in
`src/data/monsters/types.ts`, map stable monster IDs to assets imported from a
TypeScript module (JSON cannot import Vite URLs), and add image, alt-text, and
fallback rendering to `MonsterDetailPanel.tsx` and any intentional thumbnail
surfaces.

## Validate Content Changes

Run the production build and the smallest relevant targeted lint:

```powershell
npm run build

# Monster changes
npx eslint src/data/monsters/types.ts src/data/monsters/index.ts src/pages/MonsterListPage.tsx src/components/MonsterDetailPanel.tsx

# Bloodline changes
npx eslint src/ruleData.ts src/types.ts src/components/BloodlineCarousel.tsx src/pages/CharacterCreationPage.tsx

git diff --check
```

Run `npm run dev` and inspect `/#/monsters`, `/#/character-creation`, and the
campaign dungeon and encounter selectors. For artwork, check desktop and
mobile layouts and confirm that an unillustrated record still displays its
fallback.
