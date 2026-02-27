import { Link } from 'react-router-dom';
import './HowToPlayPage.css';

export function HowToPlayPage() {
    return (
        <div className="how-to-play-page">
            <header className="how-to-play-page__header">
                <div className="how-to-play-page__header-top">
                    <Link to="/" className="how-to-play-page__home-link">← Home</Link>
                    <h1>How To Play</h1>
                </div>
            </header>

            <main className="how-to-play-page__main">
                <article className="how-to-play-article">
                    <h2>PILLAR WORLDS</h2>
                    <p>
                        In an age long past, the forbidden love between the Sun and Moon gave life to the first magical beings: dragons. The hatching of the first dragons shattered the world into a thousand fragments. The dragons were ravenous, brimming with unbridled energy. They fought one another in a brutal war, soaking the land in their magical blood.
                    </p>
                    <p>
                        As the dragon war came to a close, the primordial titans reforged the shattered land into six great pillar worlds. The six pillars hold the Sun aloft, forever separating him from his love, the Moon. On the pillars worlds, new creatures rose up from the blood-soaked earth. Bathed in the magic of dragonblood, the land gave rise to more powerful creatures than ever before. Where simple apes once tread, empires of magic-wielding humanoids arose.
                    </p>
                    <p>
                        Millennia have passed since the hatching of the first dragons, and now their humanoid descendants rule diverse kingdoms scattered across the pillar worlds. Plagued by monsters from beyond the mortal realm and those born of dragon’s blood, these kingdoms depend on monster-hunting heroes to rise up and defend them. All the while, the machinations of capricious gods drive mortals to war amongst themselves.
                    </p>

                    <h2>Rules</h2>

                    <h3>Role-Playing</h3>
                    <p>
                        In this game you create a fantasy character who will go on adventures, slay monsters, and learn to wield magical powers. Your character’s skills and abilities set them apart from other adventurers and determine what they’re good at.
                    </p>
                    <p>
                        When you create your character, you choose what kind of body, mind, and spirit they have, as well as the zodiac sign that they are born under. These choices will decide their starting skills.
                    </p>
                    <p>
                        You also choose which bloodline they are descended from, such as that of a god, dragon, titan, or cosmic entity. Your bloodline grants you a unique ability. The rest of your starting abilities are determined by your backstory, which is made up of three story fragments: your birth, youth, and coming-of-age.
                    </p>

                    <h3>Skill Checks</h3>
                    <p>
                        On your turn, you can make two skill checks. A skill check is a test of your character’s competence and luck, and is represented by rolling two six-sided dice. Skill checks can be made to attack, push, influence, focus on, or hide from enemies. The target of a skill check rolls as well to avoid the effect. If the attacker and defender score the same result, the defender wins.
                    </p>
                    <p>
                        When you succeed on an offensive skill check (a skill check that you initiate against a target), you recover mana equal to 1 + your instinct bonus. You don’t recover mana for defensive rolls (a roll that you make to avoid an enemy’s offensive check).
                    </p>

                    <hr className="divider" />

                    <h3>Charisma (CHA)</h3>
                    <div className="skill-action">
                        <h4>Influence</h4>
                        <div className="skill-check-details">CHA vs. WIS</div>
                        <p>Grant the target disadvantage on their next roll.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Persuade</h4>
                        <div className="skill-check-details">CHA vs. WIS (non-hostile character)</div>
                        <p>Charm, deceive, or intimidate the target into changing their course of action. You cannot persuade a character into taking actions that would harm themselves or their allies.</p>
                    </div>

                    <h3>Instinct (INS)</h3>
                    <div className="skill-action">
                        <h4>Magic attack</h4>
                        <div className="skill-check-details">1 MP<br />INS vs. STL (an enemy you can see)</div>
                        <p>Deal 1 magic damage.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Sense</h4>
                        <p>Observe your surroundings in search of secrets or hidden dangers. Hidden enemies must make a STL check against your INS roll to remain hidden.</p>
                    </div>

                    <h3>Prowess (PRW)</h3>
                    <div className="skill-action">
                        <h4>Physical attack</h4>
                        <div className="skill-check-details">PRW vs. STL</div>
                        <p>Deal STR physical damage to your target.<br />Ranged weapons can target any enemy you can see, but melee attacks can only be made against enemies within your reach.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Traverse</h4>
                        <p>Quickly run, climb, jump, or swim through irregular terrain. Skill check difficulty is determined by the danger level of the terrain.</p>
                    </div>

                    <h3>Stealth (STL)</h3>
                    <div className="skill-action">
                        <h4>Hide</h4>
                        <div className="skill-check-details">STL vs. INS</div>
                        <p>Gain advantage on your next roll against the target.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Steal</h4>
                        <div className="skill-check-details">STL vs. INS (an enemy within your reach)</div>
                        <p>Remove an item that the target carries without them noticing. You cannot steal an item from out of an enemy’s hand, or apparel that they are wearing.</p>
                    </div>

                    <h3>Strength (STR)</h3>
                    <div className="skill-action">
                        <h4>Push</h4>
                        <div className="skill-check-details">STR vs. STR (an enemy within your reach)</div>
                        <p>You forcibly move your target into an adjacent zone. If you are elevated, they fall and take 2 physical damage for each level of elevation.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Heave</h4>
                        <p>Move a heavy object or obstacle. Skill check difficulty is determined by the target’s weight.</p>
                    </div>

                    <h3>Wisdom (WIS)</h3>
                    <div className="skill-action">
                        <h4>Focus</h4>
                        <div className="skill-check-details">WIS vs. CHA</div>
                        <p>Gain a +1 bonus to all subsequent skill checks against the target as long as you can see them.<br />Points of focus can stack on one or multiple enemies.<br />When you lose HP, lose all focus.<br />The maximum amount of focus that you can have on one enemy is that same as your maximum mana.</p>
                    </div>
                    <div className="skill-action">
                        <h4>Decipher</h4>
                        <p>Translate a foreign language or secret code. Skill check difficulty is determined by the language’s complexity.</p>
                    </div>

                    <hr className="divider" />

                    <h3>Health and Mana (HP and MP)</h3>
                    <ul className="stats-derived-list">
                        <li><strong>Health (HP) maximum</strong> = 4 + Level + CHA</li>
                        <li><strong>Mana (MP) maximum</strong> = 3 + WIS</li>
                        <li><strong>Mana recovered on skill check success</strong> = 1 + INS</li>
                        <li>HP and MP are fully replenished when you dream or level up</li>
                    </ul>

                    <h3>Advantage & Disadvantage</h3>
                    <p>
                        In certain circumstances, you will have the upper hand against your enemy – or vice versa. In such cases, you may gain advantage or disadvantage on skill checks. When you have advantage, roll three dice and use the highest two rolls. When you have disadvantage, roll three dice and keep the lowest two rolls.
                    </p>

                    <h3>Turn Order</h3>
                    <p>
                        When encountering a group of enemies, every character and monster rolls an INS check to determine the order in which they will take their turns. Characters and monsters take their turns in order of highest INS check result to lowest. If two characters or monsters score the same INS check result, then whoever has a higher INS bonus goes first. If they both have the same INS bonus, then they roll again against each other to decide which one goes first.
                    </p>
                    <p>
                        Characters and monsters can share their turns with their allies if they are next to each other in the turn order. For example, a character could make one skill check, allow their ally to make one skill check, and then make their second skill check afterward.
                    </p>
                    <p>
                        One group can ambush another by succeeding on STL checks against the target group’s INS. A group that successfully hides can take their turns first in an encounter. If a character or monster fails such a STL check, then they roll INS to determine turn order as normal.
                    </p>

                    <h3>Zones</h3>
                    <p>
                        Environments can be divided into zones which represent the distance between characters. For example, the first floor of a building would be one zone, the second floor would be a different zone, and so would the street outside. Characters can reach any other character or monster within the same zone as them for melee attacks or touch-based effects.
                    </p>
                    <p>
                        On your turn you can move between two adjacent zones, such as climbing the stairs to the second floor or exiting the door into the street. You only have one movement per turn unless an ability grants you additional movement.
                    </p>
                    <p>
                        When you move to an elevated zone, you have high ground against anyone on a lower elevation. High ground has many benefits in combat.
                    </p>
                    <ul>
                        <li>You can’t make melee attacks against target on a different elevation than you.</li>
                        <li>When you have high ground, your physical attacks have advantage against lower enemies.</li>
                        <li>When you have low ground, your physical attacks have disadvantage against higher enemies.</li>
                    </ul>

                    <h3>Powers and Mastery</h3>
                    <p>
                        Your magical blood grants you influence over the forces of the universe, but hard work and dedication may grant you extraordinary abilities as well. As you progress, you may unlock the true potential of your powers, manifesting in a range of abilities. You may choose to commit yourself to the study of one power, or you may learn to wield new powers over time.
                    </p>

                    <h3>Abilities</h3>
                    <p>
                        As you progress, you will earn ability points (AP), which you can spend to unlock abilities associated with your powers or equipment. You can also invest AP into further developing your existing abilities to maximize their potential.
                    </p>

                </article>
            </main>
        </div>
    );
}
