import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, Handle, Position, BackgroundVariant, addEdge, ConnectionMode } from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { CampaignCharacter, Location, CampaignFaction, Region } from '../../types/campaign';

type GraphEntity = CampaignCharacter | Location | CampaignFaction | Region;

interface SocialNetworkViewProps {
    onSelectRegion: (id: string | null) => void;
    onSelectLocation: (id: string | null) => void;
}

const NodeHandle = ({ type, position, id }: { type: 'source' | 'target', position: Position, id: string }) => (
    <Handle
        type={type}
        position={position}
        id={id}
        style={{ background: 'var(--gold)', width: '6px', height: '6px', border: '1px solid rgba(0,0,0,0.2)' }}
    />
);

const NODE_TYPES = {
    group: ({ data }: { data: { label: string } }) => (
        <div style={{ padding: '20px', background: 'transparent', border: '1px dashed rgba(154, 123, 10, 0.4)', borderRadius: '12px', width: '100%', height: '100%', pointerEvents: 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-22px', left: '5px', fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.8 }}>{data.label}</div>
        </div>
    ),
    character: ({ data }: { data: { label: string } }) => (
        <div style={{ padding: '8px 12px', background: 'var(--parchment)', border: '2px solid var(--gold)', borderRadius: '4px', minWidth: '80px', textAlign: 'center', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: 'var(--ink)' }}>
            <NodeHandle type="source" position={Position.Top} id="top" />
            <NodeHandle type="source" position={Position.Bottom} id="bottom" />
            <strong>{data.label}</strong>
        </div>
    ),
    location: ({ data }: { data: { label: string, type: string } }) => (
        <div style={{ padding: '10px', background: 'var(--burgundy)', color: 'white', border: '2px solid var(--gold)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <NodeHandle type="source" position={Position.Top} id="top" />
            <NodeHandle type="source" position={Position.Bottom} id="bottom" />
            <div><strong>{data.label}</strong></div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{data.type?.toUpperCase()}</div>
        </div>
    ),
    faction: ({ data }: { data: { label: string } }) => (
        <div style={{ padding: '10px', background: 'var(--ink)', color: 'var(--parchment)', border: '2px solid var(--gold)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', margin: '15px' }}>
            <NodeHandle type="source" position={Position.Top} id="top" />
            <NodeHandle type="source" position={Position.Bottom} id="bottom" />
            <div>
                <strong>{data.label}</strong>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>FACTION</div>
        </div>
    ),
    dungeon: ({ data }: { data: { label: string } }) => (
        <div style={{ padding: '10px', background: '#2c2c2c', color: 'var(--parchment)', border: '2px dashed var(--gold)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
            <NodeHandle type="source" position={Position.Top} id="top" />
            <NodeHandle type="source" position={Position.Bottom} id="bottom" />
            <div><strong>{data.label}</strong></div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>DUNGEON</div>
        </div>
    )
};

export function SocialNetworkView({ onSelectRegion, onSelectLocation }: SocialNetworkViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedEntityType, setSelectedEntityType] = useState<'character' | 'location' | 'faction' | 'dungeon' | 'group' | null>(null);

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge(params, eds));

        // Handle logic: if connecting a Character to a Faction or Location, update affiliation
        const { source, target } = params;
        if (!source || !target) return;

        const character = data.characters.find(c => c.id === source);
        const targetEntity = (data.factions || []).find(f => f.id === target) || data.locations.find(l => l.id === target);

        if (character && targetEntity) {
            const currentAffils = Array.isArray(character.affiliation) ? character.affiliation : [];
            if (!currentAffils.includes(target)) {
                const updatedChar: CampaignCharacter = { ...character, affiliation: [...currentAffils, target] };
                updateEntities('characters', data.characters.map(c => c.id === source ? updatedChar : c));
            }
        }
    }, [data, updateEntities, setEdges]);

    const handleAddGeneratedNPC = useCallback((locationId: string) => {
        const firstNames = ['Alden', 'Bryn', 'Caelum', 'Dara', 'Elowen', 'Faelan', 'Gwen', 'Harek', 'Iseult', 'Jorah', 'Kael', 'Lyra', 'Marek', 'Niamh', 'Orin', 'Phaedra', 'Quill', 'Rhiannon', 'Soren', 'Thalia'];
        const lastNames = ['Shadowstep', 'Brighthelm', 'Ironfoot', 'Stormborn', 'Oakheart', 'Silverleaf', 'Stonebrow', 'Swiftwind', 'Goldhand', 'Nightshade'];
        const roles = ['Merchant', 'Guard', 'Scholar', 'Blacksmith', 'Innkeeper', 'Hunter', 'Farmer', 'Baker', 'Noble', 'Scoundrel'];
        const goals = ['Seeking lost treasure', 'Looking for a relative', 'Expanding their business', 'Protecting the innocent', 'escaping a dark past', 'Proving their worth', 'Learning ancient magic'];

        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const randomGoal = goals[Math.floor(Math.random() * goals.length)];

        const newNpc: CampaignCharacter = {
            id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: randomName,
            description: `A ${randomRole.toLowerCase()} from the local area.`,
            role: randomRole,
            goal: randomGoal,
            bloodlineId: 'bloodline.human',
            notes: '',
            locationId: locationId,
            affiliation: []
        };

        updateEntities('characters', [...data.characters, newNpc]);
    }, [data.characters, updateEntities]);

    // Auto-generate layout
    useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // 1. Create Regional Groups/Containers in a Grid
        const regions = data.regions || [];
        const cols = 2; // Use 2 columns to use vertical space better

        regions.forEach((r, rIdx) => {
            const gridX = (rIdx % cols) * 1100;
            const gridY = Math.floor(rIdx / cols) * 1000;

            newNodes.push({
                id: `group_${r.id}`,
                type: 'group',
                position: { x: gridX, y: gridY },
                data: { label: r.name },
                style: { width: 1000, height: 900, zIndex: -1, backgroundColor: 'transparent' },
                draggable: true
            });

            const regionLocs = data.locations.filter(l => l.regionId === r.id);
            regionLocs.forEach((loc, lIdx) => {
                const locId = loc.id;
                // RELATIVE positioning inside the group node - increased spacing
                const relX = (lIdx % 2 === 0 ? 150 : 650);
                const relY = Math.floor(lIdx / 2) * 450 + 80;

                newNodes.push({
                    id: locId,
                    type: loc.type === 'dungeon' ? 'dungeon' : 'location',
                    position: { x: relX, y: relY },
                    data: { label: loc.name, type: loc.type },
                    parentNode: `group_${r.id}`,
                    extent: 'parent'
                });

                // Find Characters in this Location - wider radius for less tension
                const locChars = data.characters.filter(c => c.locationId === locId);
                const radius = 130;

                locChars.forEach((c, cIdx) => {
                    const angle = (cIdx / Math.max(1, locChars.length)) * Math.PI * 2;
                    // Relative to LOCATION node inside GROUP
                    const charRelX = relX + Math.cos(angle) * radius + 10;
                    const charRelY = relY + Math.sin(angle) * radius + 50;

                    newNodes.push({
                        id: c.id,
                        type: 'character',
                        position: { x: charRelX, y: charRelY },
                        data: { label: c.name },
                        parentNode: `group_${r.id}`,
                        extent: 'parent'
                    });

                    // Edge: Character -> Location (Home)
                    newEdges.push({
                        id: `e_${c.id}_${loc.id}`,
                        source: c.id,
                        target: loc.id,
                        sourceHandle: charRelY > relY ? 'top' : 'bottom',
                        targetHandle: charRelY > relY ? 'bottom' : 'top',
                        style: { stroke: 'var(--gold)', strokeWidth: 2, opacity: 0.5 },
                        animated: true
                    });

                    // Edge: Character Affiliations (Factions)
                    const affils = Array.isArray(c.affiliation) ? c.affiliation : (c.affiliation ? [c.affiliation] : []);
                    affils.forEach(affilId => {
                        if (affilId !== loc.id) {
                            const otherLoc = data.locations.find(l => l.id === affilId);

                            // Determine relative verticality for shortest path
                            // Factions are at -400, gridY starts at 0. So factions are always "top".
                            // Location inside another group might be anywhere.
                            let targetIsAbove = true;
                            if (otherLoc) {
                                const otherGroup = data.regions.findIndex(r => r.id === otherLoc.regionId);
                                const otherGridY = Math.floor(otherGroup / cols) * 850;
                                const otherRelY = (data.locations.filter(l => l.regionId === otherLoc.regionId).indexOf(otherLoc) / 2) * 350 + 50;
                                targetIsAbove = (otherGridY + otherRelY) < (gridY + charRelY);
                            }

                            newEdges.push({
                                id: `e_${c.id}_affil_${affilId}`,
                                source: c.id,
                                target: affilId,
                                sourceHandle: targetIsAbove ? 'top' : 'bottom',
                                targetHandle: targetIsAbove ? 'bottom' : 'top',
                                style: { stroke: 'var(--parchment-dark)', strokeDasharray: '4 4', opacity: 0.3 }
                            });
                        }
                    });
                });
            });
        });

        // 2. Add Faction Nodes ABOVE the grid
        const factions = data.factions || [];
        factions.forEach((f, i) => {
            newNodes.push({
                id: f.id,
                type: 'faction',
                position: { x: i * 300 + 100, y: -400 },
                data: { label: f.name }
            });
        });

        // 3. Add Unassociated Characters BELOW the grid
        const unassocChars = data.characters.filter(c => !c.locationId);
        const maxY = Math.ceil(regions.length / cols) * 1000;
        unassocChars.forEach((c, cIdx) => {
            newNodes.push({
                id: c.id,
                type: 'character',
                position: { x: cIdx * 150, y: maxY + 100 },
                data: { label: c.name }
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [data, setNodes, setEdges]);

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        setSelectedEntityId(node.id);
        const type = node.type as 'character' | 'location' | 'faction' | 'dungeon' | 'group';
        setSelectedEntityType(type);
    };

    const renderSidePanel = () => {
        if (!selectedEntityId || !selectedEntityType) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
                    <p>Select a node to view its details.</p>
                </div>
            );
        }

        let entity: GraphEntity | undefined = undefined;
        if (selectedEntityType === 'character') entity = data.characters.find(c => c.id === selectedEntityId);
        else if (selectedEntityType === 'location' || selectedEntityType === 'dungeon') entity = data.locations.find(l => l.id === selectedEntityId);
        else if (selectedEntityType === 'faction') entity = (data.factions || []).find(f => f.id === selectedEntityId);
        else if (selectedEntityType === 'group') entity = data.regions.find(r => r.id === selectedEntityId.replace('group_', ''));

        if (!entity) return null;

        const isChar = selectedEntityType === 'character';
        const isLoc = selectedEntityType === 'location' || selectedEntityType === 'dungeon';
        const isGroup = selectedEntityType === 'group';

        return (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--burgundy)' }}>{entity.name}</h3>
                    <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                        {isLoc ? (
                            `Location - ${((entity as Location).type || '').charAt(0).toUpperCase() + ((entity as Location).type || '').slice(1)}`
                        ) : (
                            selectedEntityType.toUpperCase()
                        )}
                    </div>
                </div>

                {isChar && (
                    <button
                        className="campaign-btn-primary"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        onClick={() => {
                            if ((entity as CampaignCharacter).locationId) {
                                onSelectLocation((entity as CampaignCharacter).locationId!);
                            }
                        }}
                    >
                        View in Character List
                    </button>
                )}

                {isLoc && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            className="campaign-btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => onSelectLocation(entity.id)}
                        >
                            Open {selectedEntityType === 'dungeon' ? 'Dungeon' : 'Settlement'} Page
                        </button>
                        {selectedEntityType === 'location' && (
                            <button
                                className="campaign-btn-secondary"
                                style={{ width: '100%', borderColor: 'var(--gold)', color: 'var(--burgundy)' }}
                                onClick={() => handleAddGeneratedNPC(entity.id)}
                            >
                                ✨ Auto-Generate NPC
                            </button>
                        )}
                    </div>
                )}

                {isGroup && (
                    <button
                        className="campaign-btn-primary"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        onClick={() => onSelectRegion(entity.id)}
                    >
                        Jump to Region Overview
                    </button>
                )}

                {entity.description && (
                    <div className="campaign-entity-notes">
                        <strong>Description:</strong>
                        <p>{entity.description || 'No description provided.'}</p>
                    </div>
                )}

                {isChar && (
                    <>
                        {(entity as CampaignCharacter).role && <div className="campaign-entity-notes"><strong>Role:</strong> {(entity as CampaignCharacter).role}</div>}
                        {(entity as CampaignCharacter).goal && <div className="campaign-entity-notes"><strong>Goal:</strong> {(entity as CampaignCharacter).goal}</div>}
                        {(entity as CampaignCharacter).notes && <div className="campaign-entity-notes"><strong>Notes:</strong> {(entity as CampaignCharacter).notes}</div>}
                    </>
                )}

                {selectedEntityType === 'location' && (
                    <>
                        {(entity as Location).leader && <div className="campaign-entity-notes"><strong>Leader:</strong> {(entity as Location).leader}</div>}
                        {(entity as Location).economy && <div className="campaign-entity-notes"><strong>Economy:</strong> {(entity as Location).economy}</div>}
                    </>
                )}

                {selectedEntityType === 'dungeon' && (
                    <>
                        {(entity as Location).traps && <div className="campaign-entity-notes"><strong>Traps:</strong> {(entity as Location).traps}</div>}
                        {(entity as Location).secrets && <div className="campaign-entity-notes"><strong>Secrets:</strong> {(entity as Location).secrets}</div>}
                        {(entity as Location).loot && <div className="campaign-entity-notes"><strong>Loot:</strong> {(entity as Location).loot}</div>}
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '60vh', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative', background: 'var(--ink)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onPaneClick={() => { setSelectedEntityId(null); setSelectedEntityType(null); }}
                    nodeTypes={NODE_TYPES}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--parchment-dark)" />
                    <Controls style={{ background: 'var(--parchment)', fill: 'var(--ink)' }} />
                    <MiniMap nodeStrokeColor="var(--gold)" nodeColor="var(--parchment)" maskColor="rgba(0,0,0,0.5)" />
                </ReactFlow>
            </div>

            {selectedEntityId && (
                <div style={{
                    width: '300px',
                    background: 'var(--parchment)',
                    borderLeft: '1px solid var(--ink)',
                    boxShadow: '-4px 0 10px rgba(0,0,0,0.1)'
                }}>
                    {renderSidePanel()}
                </div>
            )}
        </div>
    );
}
