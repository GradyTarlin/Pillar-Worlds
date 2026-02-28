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
    const [customExpression, setCustomExpression] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of history
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [history, isOpen]);

    const performRoll = (expression: string) => {
        if (!expression.trim()) return;

        // Clean spaces and lower case
        const expr = expression.replace(/\s+/g, '').toLowerCase();

        // Very basic parsing: (optional N)d(D)(optional +M or -M)
        // e.g. d20, 2d6, 1d20+3, 4d8-1
        // We will sum up multiple parts if we split by +, but let's keep it simple first

        let total = 0;
        const detailsArr: string[] = [];

        // Handle parts split by '+' or '-'
        // Example: 1d20+2d6+3
        // To keep it simple, we'll use a regex that handles individual parts
        const partRegex = /([+-])?(?:(\d*)d(\d+)|(\d+))/g;
        let match;

        let validExpression = false;

        while ((match = partRegex.exec(expr)) !== null) {
            if (match[0].length === 0) continue;
            validExpression = true;

            const signStr = match[1] || '+';
            const sign = signStr === '-' ? -1 : 1;

            const numDiceStr = match[2];
            const diceFacesStr = match[3];
            const flatModStr = match[4];

            if (flatModStr) {
                // It's a flat modifier
                const val = parseInt(flatModStr, 10);
                total += sign * val;
                detailsArr.push(`${signStr === '-' ? '-' : (detailsArr.length > 0 ? '+' : '')}${val}`);
            } else if (diceFacesStr) {
                // It's a dice roll
                const numDice = numDiceStr ? parseInt(numDiceStr, 10) : 1;
                const faces = parseInt(diceFacesStr, 10);

                const rolls = [];
                let subTotal = 0;
                for (let i = 0; i < numDice; i++) {
                    const r = Math.floor(Math.random() * faces) + 1;
                    rolls.push(r);
                    subTotal += r;
                }

                total += sign * subTotal;
                const prefix = signStr === '-' ? '-' : (detailsArr.length > 0 ? '+' : '');
                detailsArr.push(`${prefix}[${rolls.join(', ')}]`);
            }
        }

        if (!validExpression) return;

        const newRoll: RollResult = {
            id: `roll_${Date.now()}_${Math.random()}`,
            expression,
            total,
            details: detailsArr.join(' '),
            timestamp: new Date()
        };

        setHistory(prev => [...prev, newRoll].slice(-50)); // Keep last 50
    };

    const handleRoll2d6 = () => {
        performRoll(`2d6`);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performRoll(customExpression);
        setCustomExpression('');
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
                        <div className="dice-quick-buttons" style={{ display: 'flex' }}>
                            <button className="dice-btn" style={{ flex: 1, padding: '0.5rem', fontWeight: 'bold' }} onClick={handleRoll2d6}>
                                Roll 2d6
                            </button>
                        </div>
                        <form className="dice-custom-form" onSubmit={handleCustomSubmit}>
                            <input
                                type="text"
                                value={customExpression}
                                onChange={e => setCustomExpression(e.target.value)}
                                placeholder="e.g. 2d6+3"
                            />
                            <button type="submit">Roll</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
