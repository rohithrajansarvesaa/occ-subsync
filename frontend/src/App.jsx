import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { getSubscriptions } from './services/api';
import SubscriptionForm from './components/SubscriptionForm';
import SubscriptionCard from './components/SubscriptionCard';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} role="alert">
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

function EditModal({ sub, onSaved, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>✏️ Edit Subscription</h2>
        <SubscriptionForm initial={sub} onSaved={onSaved} onCancel={onClose} embedded />
      </div>
    </div>
  );
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthlySpend, setTotalMonthlySpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
      setTotalMonthlySpend(res.totalMonthlySpend);
    } catch (err) {
      setError('Could not load subscriptions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSaved = () => {
    fetchSubscriptions();
    setEditTarget(null);
    showToast(editTarget ? 'Subscription updated!' : 'Subscription added!');
  };

  const handleDeleted = (id) => {
    setSubscriptions((prev) => prev.filter((s) => s._id !== id));
    setTotalMonthlySpend((prev) => {
      const sub = subscriptions.find((s) => s._id === id);
      if (!sub) return prev;
      return parseFloat(
        (prev - (sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost)).toFixed(2)
      );
    });
    showToast('Subscription removed.', 'success');
  };

  const monthlyCount = subscriptions.filter((s) => s.billingCycle === 'monthly').length;
  const yearlyCount = subscriptions.filter((s) => s.billingCycle === 'yearly').length;
  const yearlyTotal = parseFloat((totalMonthlySpend * 12).toFixed(2));

  // apply text search to subscriptions list
  const filteredSubscriptions = subscriptions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">💳</div>
          <div>
            <h1>
              SubSync
              <span className="header-badge" title="Active subscriptions">
                {subscriptions.length}
              </span>
            </h1>
            <p className="header-subtitle">Subscription Management Dashboard</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px' }}>
          <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button className="btn btn-ghost btn-sm" onClick={fetchSubscriptions} style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <section aria-label="Spending Summary">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">💰 Total Monthly Spend</div>
            <div className="stat-value" id="total-monthly-cost">₹{totalMonthlySpend.toFixed(2)}</div>
            <div className="stat-sub">≈ ₹{yearlyTotal.toFixed(2)} / year</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">📋 Active Subscriptions</div>
            <div className="stat-value">{subscriptions.length}</div>
            <div className="stat-sub">{monthlyCount} monthly · {yearlyCount} yearly</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">📅 Avg. Per Service</div>
            <div className="stat-value">
              ₹{subscriptions.length ? (totalMonthlySpend / subscriptions.length).toFixed(2) : '0.00'}
            </div>
            <div className="stat-sub">per month per service</div>
          </div>
        </div>
      </section>

      {/* Add Form */}
      <section aria-label="Add Subscription">
        <SubscriptionForm onSaved={handleSaved} />
      </section>

      {/* Subscription List */}
      <section aria-label="Subscription List">
        <div className="section-header">
          <h2 className="section-title">Your Subscriptions</h2>
          <div className="section-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="section-count">{filteredSubscriptions.length} services</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No subscriptions yet</h3>
            <p>Add your first subscription using the form above.</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No matching services</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          <div className="subscription-list" id="subscription-list">
            {filteredSubscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                sub={sub}
                onEdit={setEditTarget}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          sub={editTarget}
          onSaved={handleSaved}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
