import { useEffect, useState } from 'react';
import ReactFlow, {
    Background, Controls, MiniMap,
    useNodesState, useEdgesState,
    Handle, Position, BackgroundVariant
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCampaignData } from '../../hooks/useCampaignData';

const NODE_TYPES = {
    character: ({ data }: any) => (
        <div style={{ padding: '10px', background: 'var(--parchment)', border: '2px solid var(--accent)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
            <strong>{data.label}</strong>
        </div>
    ),
    location: ({ data }: any) => (
        <div style={{ padding: '10px', background: 'var(--burgundy)', color: 'white', border: '2px solid var(--gold)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
            <div><strong>{data.label}</strong></div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{data.type}</div>
        </div>
    ),
    faction: ({ data }: any) => (
        <div style={{ padding: '10px', background: 'var(--ink)', color: 'white', border: '2px solid var(--accent)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', margin: '15px' }}>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
            <div>
                <strong>{data.label}</strong>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>FACTION</div>
        </div>
    ),
    dungeon: ({ data }: any) => (
        <div style={{ padding: '10px', background: 'var(--bg-dark)', color: 'var(--parchment)', border: '2px dashed var(--accent)', borderRadius: '8px', minWidth: '100px', textAlign: 'center', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
            <div><strong>{data.label}</strong></div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>DUNGEON</div>
        </div>
    )
};

export function SocialNetworkView() {
    const { data } = useCampaignData();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedEntityType, setSelectedEntityType] = useState<'character' | 'location' | 'faction' | 'dungeon' | null>(null);

    // Auto-generate layout
    useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        let xOffset = 0;

        // Create Faction Nodes
        const factions = data.factions || [];
        factions.forEach((f, i) => {
            newNodes.push({
                id: f.id,
                type: 'faction',
                position: { x: xOffset + i * 200, y: -200 },
                data: { label: f.name }
            });
        });

        // Group Locations by Region
        const regions = data.regions || [];
        regions.forEach((r, rIdx) => {
            const regionLocs = data.locations.filter(l => l.regionId === r.id);

            regionLocs.forEach((loc, lIdx) => {
                const locId = loc.id;
                const baseX = rIdx * 600 + lIdx * 300;
                const baseY = 200;

                newNodes.push({
                    id: locId,
                    type: loc.type === 'dungeon' ? 'dungeon' : 'location',
                    position: { x: baseX, y: baseY },
                    data: { label: loc.name, type: loc.type }
                });

                // Find Characters in this Location
                const locChars = data.characters.filter(c => c.locationId === locId);
                const radius = 150;

                locChars.forEach((c, cIdx) => {
                    const angle = (cIdx / Math.max(1, locChars.length)) * Math.PI * 2;
                    const cx = baseX + Math.cos(angle) * radius;
                    const cy = baseY + Math.sin(angle) * radius + 50; // offset slightly below

                    newNodes.push({
                        id: c.id,
                        type: 'character',
                        position: { x: cx, y: cy },
                        data: { label: c.name }
                    });

                    // Edge: Character -> Location
                    newEdges.push({
                        id: `e_${c.id}_${loc.id}`,
                        source: c.id,
                        target: loc.id,
                        style: { stroke: 'var(--accent)', strokeWidth: 2 },
                        animated: true
                    });

                    // Edge: Character Affiliations (Factions / Other locations)
                    const affils = Array.isArray(c.affiliation) ? c.affiliation : (c.affiliation ? [c.affiliation] : []);
                    affils.forEach(affilId => {
                        if (affilId !== loc.id) { // Don't duplicate home settlement links
                            newEdges.push({
                                id: `e_${c.id}_affil_${affilId}`,
                                source: c.id,
                                target: affilId,
                                style: { stroke: 'var(--text-light)', strokeDasharray: '5 5' }
                            });
                        }
                    });

                    // Edge: Quests (Character -> Dungeon)
                    const charQuests = data.quests.filter(q => q.clientId === c.id);
                    charQuests.forEach(q => {
                        if (q.locationId) {
                            newEdges.push({
                                id: `e_${c.id}_quest_${q.locationId}`,
                                source: c.id,
                                target: q.locationId,
                                style: { stroke: 'var(--burgundy)', strokeWidth: 2 },
                                label: 'Quest Client'
                            });
                        }
                    });
                });
            });
        });

        // Add Unassociated Characters
        const unassocChars = data.characters.filter(c => !c.locationId);
        unassocChars.forEach((c, cIdx) => {
            newNodes.push({
                id: c.id,
                type: 'character',
                position: { x: cIdx * 100, y: 600 },
                data: { label: c.name }
            });

            const affils = Array.isArray(c.affiliation) ? c.affiliation : (c.affiliation ? [c.affiliation] : []);
            affils.forEach(affilId => {
                newEdges.push({
                    id: `e_${c.id}_affil_${affilId}`,
                    source: c.id,
                    target: affilId,
                    style: { stroke: 'var(--text-light)', strokeDasharray: '5 5' }
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [data, setNodes, setEdges]);

    const handleNodeClick = (_event: any, node: Node) => {
        setSelectedEntityId(node.id);
        setSelectedEntityType(node.type as any);
    };

    const renderSidePanel = () => {
        if (!selectedEntityId || !selectedEntityType) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
                    <p>Select a node to view its details.</p>
                </div>
            );
        }

        let entity: any = null;
        if (selectedEntityType === 'character') entity = data.characters.find(c => c.id === selectedEntityId);
        else if (selectedEntityType === 'location' || selectedEntityType === 'dungeon') entity = data.locations.find(l => l.id === selectedEntityId);
        else if (selectedEntityType === 'faction') entity = data.factions?.find(f => f.id === selectedEntityId);

        if (!entity) return null;

        const locEncounters = data.encounters?.filter(e => e.locationId === selectedEntityId) || [];

        return (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
                <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--burgundy)' }}>{entity.name}</h3>
                <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--ink-muted)' }}>
                    {selectedEntityType} {entity.type ? ` - ${entity.type}` : ''}
                </div>

                {entity.description && (
                    <div className="campaign-entity-notes">
                        <strong>Description:</strong>
                        <p>{entity.description}</p>
                    </div>
                )}

                {selectedEntityType === 'character' && (
                    <>
                        {entity.role && <div className="campaign-entity-notes"><strong>Role:</strong> {entity.role}</div>}
                        {entity.goal && <div className="campaign-entity-notes"><strong>Goal:</strong> {entity.goal}</div>}
                        {entity.notes && <div className="campaign-entity-notes"><strong>Notes:</strong> {entity.notes}</div>}
                    </>
                )}

                {selectedEntityType === 'location' && (
                    <>
                        {entity.leader && <div className="campaign-entity-notes"><strong>Leader:</strong> {entity.leader}</div>}
                        {entity.economy && <div className="campaign-entity-notes"><strong>Economy:</strong> {entity.economy}</div>}
                    </>
                )}

                {selectedEntityType === 'dungeon' && (
                    <>
                        {entity.traps && <div className="campaign-entity-notes"><strong>Traps:</strong> {entity.traps}</div>}
                        {entity.secrets && <div className="campaign-entity-notes"><strong>Secrets:</strong> {entity.secrets}</div>}
                        {entity.loot && <div className="campaign-entity-notes"><strong>Loot:</strong> {entity.loot}</div>}
                        {locEncounters.length > 0 && (
                            <div className="campaign-entity-notes" style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>
                                <strong>Encounters:</strong> {locEncounters.map(e => e.name).join(', ')}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative', background: 'var(--bg-dark)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    onPaneClick={() => { setSelectedEntityId(null); setSelectedEntityType(null); }}
                    nodeTypes={NODE_TYPES}
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="var(--parchment-dark)" />
                    <Controls style={{ background: 'var(--parchment)', fill: 'var(--ink)' }} />
                    <MiniMap nodeStrokeColor="var(--accent)" nodeColor="var(--parchment)" maskColor="rgba(0,0,0,0.5)" />
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
