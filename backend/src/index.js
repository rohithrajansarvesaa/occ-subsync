require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/subsync';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/subscriptions', subscriptionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'subsync-backend' });
});

// 404 catch-all
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Connect to MongoDB then start server
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 SubSync API running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
