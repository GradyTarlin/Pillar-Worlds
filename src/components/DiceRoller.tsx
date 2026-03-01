import { useState, useRef, useEffect } from 'react';
import './DiceRoller.css';

interface RollResult {
    id: string;
    expression: string;
    total: number;
    details: string;
    timestamp: Date;
}

export function DiceRoller() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<RollResult[]>([]);
    const [advantageState, setAdvantageState] = useState<'none' | 'adv' | 'dis'>('none');
    const [bonus, setBonus] = useState<number>(0);
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of history
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [history, isOpen]);

    const handleRoll = () => {
        let numDice = 2;
        if (advantageState !== 'none') {
            numDice = 3;
        }

        const rolls = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }

        let keptRolls = [...rolls];
        let total = 0;
        let details = '';

        if (advantageState === 'adv') {
            keptRolls.sort((a, b) => b - a); // descending
            const dropped = keptRolls.pop();
            total = keptRolls[0] + keptRolls[1] + bonus;
            details = `[${keptRolls[0]}, ${keptRolls[1]}] (dropped ${dropped})`;
        } else if (advantageState === 'dis') {
            keptRolls.sort((a, b) => a - b); // ascending
            const dropped = keptRolls.pop();
            total = keptRolls[0] + keptRolls[1] + bonus;
            details = `[${keptRolls[0]}, ${keptRolls[1]}] (dropped ${dropped})`;
        } else {
            total = rolls[0] + rolls[1] + bonus;
            details = `[${rolls[0]}, ${rolls[1]}]`;
        }

        if (bonus > 0) details += ` + ${bonus}`;
        if (bonus < 0) details += ` - ${Math.abs(bonus)}`;

        let expression = '2d6';
        if (advantageState === 'adv') expression = '3d6 (Keep Highest 2)';
        if (advantageState === 'dis') expression = '3d6 (Keep Lowest 2)';
        if (bonus !== 0) expression += ` ${bonus > 0 ? '+' : '-'}${Math.abs(bonus)}`;

        const newRoll: RollResult = {
            id: `roll_${Date.now()}_${Math.random()}`,
            expression,
            total,
            details,
            timestamp: new Date()
        };

        setHistory(prev => [...prev, newRoll].slice(-50)); // Keep last 50
    };

    return (
        <div className={`dice-roller-widget ${isOpen ? 'open' : 'closed'}`}>
            <button className="dice-roller-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕ Close Dice' : '🎲 Roller'}
            </button>

            {isOpen && (
                <div className="dice-roller-panel">
                    <div className="dice-roller-history" ref={listRef}>
                        {history.length === 0 ? (
                            <div className="dice-empty">No rolls yet...</div>
                        ) : (
                            history.map(roll => (
                                <div key={roll.id} className="dice-roll-item">
                                    <div className="dice-roll-top">
                                        <span className="dice-roll-expr">{roll.expression}</span>
                                        <span className="dice-roll-total">{roll.total}</span>
                                    </div>
                                    <div className="dice-roll-details">{roll.details}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="dice-roller-controls">
                        <div className="dice-options">
                            <button className={`dice-opt-btn ${advantageState === 'adv' ? 'active' : ''}`} onClick={() => setAdvantageState(advantageState === 'adv' ? 'none' : 'adv')}>Advantage</button>
                            <button className={`dice-opt-btn ${advantageState === 'dis' ? 'active' : ''}`} onClick={() => setAdvantageState(advantageState === 'dis' ? 'none' : 'dis')}>Disadvantage</button>
                        </div>
                        <div className="dice-bonus-control">
                            <label>Bonus: </label>
                            <input type="number" value={bonus} onChange={(e) => setBonus(parseInt(e.target.value) || 0)} />
                        </div>
                        <button className="dice-btn-main" onClick={handleRoll}>Roll</button>
                    </div>
                </div>
            )}
        </div>
    );
}
