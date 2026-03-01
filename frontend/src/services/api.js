const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) {
        const msg =
            data.errors?.[0]?.msg || data.message || 'Something went wrong';
        throw new Error(msg);
    }
    return data;
};

export const getSubscriptions = () =>
    fetch(`${API_BASE}/subscriptions`).then(handleResponse);

export const createSubscription = (payload) =>
    fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(handleResponse);

export const updateSubscription = (id, payload) =>
    fetch(`${API_BASE}/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(handleResponse);

export const deleteSubscription = (id) =>
    fetch(`${API_BASE}/subscriptions/${id}`, {
        method: 'DELETE',
    }).then(handleResponse);
