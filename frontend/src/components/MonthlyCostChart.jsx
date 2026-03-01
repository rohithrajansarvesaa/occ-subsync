import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

// expects subscriptions array from state
export default function MonthlyCostChart({ subscriptions }) {
    const data = subscriptions.map((s) => ({
        name: s.name,
        cost: s.billingCycle === 'yearly' ? s.cost / 12 : s.cost,
    }));

    return (
        <div className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="var(--border-light)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    <Bar dataKey="cost" fill="var(--accent)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
