import type { Monster } from '../data/monsters';
import { getMonsterAbilityById, getTraitById } from '../data/monsters';

export function MonsterDetailPanel({ monster, onClose }: { monster: Monster, onClose: () => void }) {
    return (
        <div className="compendium-detail">
            <button className="compendium-detail__close" onClick={onClose}>✕</button>
            <header className="compendium-detail__header">
                <h2>{monster.name}</h2>
                <div className="compendium-detail__tags">
                    <span className="compendium-detail__tag highlight">Level {monster.level}</span>
                    <span className="compendium-detail__tag">{monster.monsterType}</span>
                </div>
            </header>

            <div className="compendium-detail__content">
                {monster.loreText && (
                    <p className="compendium-detail__lore">{monster.loreText}</p>
                )}

                <section className="compendium-detail__section">
                    <h3>Stats</h3>
                    <ul className="monster-stats-list">
                        <li><strong>HP:</strong> {monster.hpMax}</li>
                        {monster.armourMax > 0 && <li><strong>Armour:</strong> {monster.armourMax}</li>}
                        {monster.wardMax > 0 && <li><strong>Ward:</strong> {monster.wardMax}</li>}
                    </ul>
                    {monster.notes && monster.notes.length > 0 && (
                        <ul className="monster-notes-list">
                            {monster.notes.map((note, idx) => (
                                <li key={idx} className="compendium-detail__note">
                                    {note}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {monster.skills && Object.keys(monster.skills).length > 0 && (
                    <section className="compendium-detail__section">
                        <h3>Skills</h3>
                        <div className="monster-skills-grid">
                            {Object.entries(monster.skills).map(([skill, val]) => (
                                <div key={skill} className="monster-skill-box">
                                    <span className="monster-skill-name">{skill}</span>
                                    <span className="monster-skill-val">+{val}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {
                    monster.traits && monster.traits.length > 0 && (
                        <section className="compendium-detail__section">
                            <h3>Traits</h3>
                            <ul className="monster-traits-list">
                                {monster.traits.map((traitId, i) => {
                                    const traitDef = getTraitById(traitId);
                                    const formattedName = traitId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    return (
                                        <li key={i}>
                                            <strong>{formattedName}</strong>
                                            {traitDef ? `: ${traitDef.rulesText}` : ''}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )
                }

                {
                    monster.abilities && monster.abilities.length > 0 && (
                        <section className="compendium-detail__section">
                            <h3>Abilities</h3>
                            <ul className="monster-abilities-list">
                                {monster.abilities.map((abilityRef, i) => {
                                    const ability = getMonsterAbilityById(abilityRef);
                                    if (ability) {
                                        return (
                                            <li key={i} className="monster-ability-item">
                                                <strong>{ability.name}</strong>
                                                {ability.check && (
                                                    <div className="monster-ability-check">
                                                        {ability.check.attackerSkill}
                                                        {ability.check.defenderSkill ? ` vs. ${ability.check.defenderSkill}` : ''}
                                                        {ability.check.range || ability.check.area ? ` (` : ''}
                                                        {ability.check.range && `range: ${ability.check.range}`}
                                                        {ability.check.range && ability.check.area ? `, ` : ''}
                                                        {ability.check.area && `area: ${ability.check.area}`}
                                                        {ability.check.range || ability.check.area ? `)` : ''}
                                                    </div>
                                                )}
                                                <div className="monster-ability-text">{ability.rulesText}</div>
                                            </li>
                                        );
                                    }
                                    return <li key={i} className="monster-ability-item"><strong>{abilityRef}</strong></li>;
                                })}
                            </ul>
                        </section>
                    )
                }

                {
                    monster.equipment && monster.equipment.length > 0 && (
                        <section className="compendium-detail__section">
                            <h3>Equipment</h3>
                            <ul className="monster-equipment-list">
                                {monster.equipment.map((eq, i) => (
                                    <li key={i} className="monster-equipment-item">
                                        <strong>{eq.name}:</strong> {eq.rulesText}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                }
            </div >
        </div >
    );
}
