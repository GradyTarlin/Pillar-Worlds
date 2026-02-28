import { useState } from 'react';
import type { SavedCharacter, CharacterSelections } from '../types';

const STORAGE_KEY = 'pillarWorlds_characters';

export function useCharacters() {
    const [characters, setCharacters] = useState<SavedCharacter[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse saved characters', e);
            }
        }
        return [];
    });

    const saveCharacters = (newCharacters: SavedCharacter[]) => {
        setCharacters(newCharacters);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCharacters));
    };

    const createCharacter = (selections: CharacterSelections): string => {
        const newChar: SavedCharacter = {
            ...selections,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            level: 1,
            extraHp: 0,
            skillIncreases: {},
            leveledGrants: []
        };
        saveCharacters([...characters, newChar]);
        return newChar.id;
    };

    const updateCharacter = (id: string, updates: Partial<SavedCharacter>) => {
        const newChars = characters.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        saveCharacters(newChars);
    };

    const deleteCharacter = (id: string) => {
        saveCharacters(characters.filter(c => c.id !== id));
    };

    return {
        characters,
        createCharacter,
        updateCharacter,
        deleteCharacter
    };
}
