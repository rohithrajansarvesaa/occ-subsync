import { useState } from 'react';
import { deleteSubscription } from '../services/api';

const CATEGORY_ICONS = {
    Streaming: '🎬',
    Music: '🎵',
    'Cloud Storage': '☁️',
    SaaS: '💼',
    Gaming: '🎮',
    News: '📰',
    Fitness: '💪',
    Other: '📦',
};

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function SubscriptionCard({ sub, onEdit, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const monthlyCost =
        sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;

    const handleDelete = async () => {
        if (!window.confirm(`Remove "${sub.name}"?`)) return;
        setDeleting(true);
        try {
            await deleteSubscription(sub._id);
            onDeleted(sub._id);
        } catch {
            setDeleting(false);
        }
    };

    return (
        <div className="sub-card" style={{ '--card-color': sub.color || '#6366f1' }}>
            <div
                className="sub-icon"
                style={{ background: `${sub.color || '#6366f1'}22`, border: `1px solid ${sub.color || '#6366f1'}44` }}
            >
                {CATEGORY_ICONS[sub.category] || '📦'}
            </div>

            <div className="sub-info">
                <h3>{sub.name}</h3>
                <div className="sub-meta">
                    <span className={`badge badge-${sub.billingCycle}`}>{sub.billingCycle}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.category}</span>
                    <span className="sub-next-date">🗓 {formatDate(sub.nextBillingDate)}</span>
                </div>
            </div>

            <div className="sub-cost">
                <div className="sub-cost-main">
                    {sub.billingCycle === 'yearly' ? '₹' + sub.cost.toFixed(2) + '/yr' : '₹' + sub.cost.toFixed(2) + '/mo'}
                </div>
                {sub.billingCycle === 'yearly' && (
                    <div className="sub-cost-monthly">₹{monthlyCost.toFixed(2)}/mo</div>
                )}
            </div>

            <div className="sub-card-actions">
                <button
                    id={`edit-${sub._id}`}
                    className="btn btn-ghost btn-sm"
                    onClick={() => onEdit(sub)}
                    aria-label={`Edit ${sub.name}`}
                >
                    ✏️
                </button>
                <button
                    id={`delete-${sub._id}`}
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    aria-label={`Delete ${sub.name}`}
                >
                    {deleting ? '⏳' : '🗑️'}
                </button>
            </div>
        </div>
    );
}
