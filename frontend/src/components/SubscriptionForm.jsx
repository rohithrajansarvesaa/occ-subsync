import { useState } from 'react';
import { createSubscription, updateSubscription } from '../services/api';

const CATEGORIES = ['Streaming', 'Music', 'Cloud Storage', 'SaaS', 'Gaming', 'News', 'Fitness', 'Other'];

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

const COLORS = [
    '#6366f1', '#a855f7', '#ec4899', '#f59e0b',
    '#10b981', '#14b8a6', '#3b82f6', '#ef4444',
];

const defaultForm = {
    name: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'Streaming',
    nextBillingDate: new Date().toISOString().split('T')[0],
    color: '#6366f1',
};

export default function SubscriptionForm({ onSaved, onCancel, initial = null, embedded = false }) {
    const [form, setForm] = useState(initial || defaultForm);
    const [loading, setLoading] = useState(false);
    // server/submission error banner
    const [error, setError] = useState('');
    // client-side validation errors keyed by field name
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
        // clear validation error for this field as user types
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // performs client-side validation, returns an object mapping field names to messages
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = 'Service name must not be empty';
        }
        if (!form.cost || parseFloat(form.cost) <= 0) {
            newErrors.cost = 'Cost must be greater than 0';
        }
        // compare dates without time component
        const today = new Date().toISOString().split('T')[0];
        if (form.nextBillingDate < today) {
            newErrors.nextBillingDate = 'Next billing date cannot be in the past';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = { ...form, cost: parseFloat(form.cost) };
            if (initial?._id) {
                await updateSubscription(initial._id, payload);
            } else {
                await createSubscription(payload);
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <>
            {error && (
                <div className="error-banner" role="alert">
                    ⚠️ {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Service Name</label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Netflix"
                            required
                        />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cost">Cost (₹)</label>
                        <input
                            id="cost"
                            name="cost"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.cost}
                            onChange={handleChange}
                            placeholder="e.g. 15.99"
                            required
                        />
                        {errors.cost && <p className="field-error">{errors.cost}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="billingCycle">Billing Cycle</label>
                        <select id="billingCycle" name="billingCycle" value={form.billingCycle} onChange={handleChange}>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={form.category} onChange={handleChange}>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {CATEGORY_ICONS[c]} {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nextBillingDate">Next Billing Date</label>
                        <input
                            id="nextBillingDate"
                            name="nextBillingDate"
                            type="date"
                            value={form.nextBillingDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.nextBillingDate && <p className="field-error">{errors.nextBillingDate}</p>}
                    </div>

                    <div className="form-group">
                        <label>Accent Color</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: c,
                                        border: form.color === c ? '3px solid white' : '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s',
                                        transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                    aria-label={`Color ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button id="submit-subscription-btn" type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '⏳ Saving…' : initial ? '✏️ Update Subscription' : '➕ Add Subscription'}
                    </button>
                    {onCancel && (
                        <button type="button" className="btn btn-ghost" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </>
    );

    if (embedded) return content;

    return (
        <div className="form-card">
            <h2>➕ Add New Subscription</h2>
            {content}
        </div>
    );
}
