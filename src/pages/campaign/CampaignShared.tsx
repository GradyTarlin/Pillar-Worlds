import type { ReactNode } from 'react';
import './CampaignShared.css';

interface ListHeaderProps {
    title: string;
    onAdd: () => void;
    addLabel?: string;
}

export function ListHeader({ title, onAdd, addLabel = 'Add New' }: ListHeaderProps) {
    return (
        <div className="campaign-list-header">
            <h2>{title}</h2>
            <button className="campaign-btn-primary" onClick={onAdd}>
                + {addLabel}
            </button>
        </div>
    );
}

interface EntityCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    tags?: string[];
    onEdit: () => void;
    onDelete: () => void;
    editIcon?: string;
    children?: ReactNode;
    isCompleted?: boolean;
}

export function EntityCard({
    title,
    subtitle,
    description,
    tags = [],
    onEdit,
    onDelete,
    editIcon,
    children,
    isCompleted = false
}: EntityCardProps) {
    return (
        <div className={`campaign-entity-card ${isCompleted ? 'completed' : ''}`}>
            <div className="campaign-entity-card__header">
                <div className="campaign-entity-card__title-group">
                    <h3>{title}</h3>
                    {subtitle && <span className="campaign-entity-card__subtitle">{subtitle}</span>}
                </div>
                <div className="campaign-entity-card__actions">
                    <button className="campaign-btn-icon" onClick={onEdit} aria-label="Edit">{editIcon || '✎'}</button>
                    <button className="campaign-btn-icon danger" onClick={onDelete} aria-label="Delete">✕</button>
                </div>
            </div>

            {tags.length > 0 && (
                <div className="campaign-entity-card__tags">
                    {tags.map((tag, i) => (
                        <span key={i} className="campaign-entity-tag">{tag}</span>
                    ))}
                </div>
            )}

            {description && (
                <p className="campaign-entity-card__desc">{description}</p>
            )}

            {children && (
                <div className="campaign-entity-card__content">
                    {children}
                </div>
            )}
        </div>
    );
}
