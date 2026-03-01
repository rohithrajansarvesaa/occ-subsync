const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');

// Validation middleware
const validateSubscription = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('cost')
        .isFloat({ min: 0.01 })
        .withMessage('Cost must be a positive number greater than $0'),
    body('billingCycle')
        .isIn(['monthly', 'yearly'])
        .withMessage('billingCycle must be monthly or yearly'),
    body('category')
        .isIn(['Streaming', 'Music', 'Cloud Storage', 'SaaS', 'Gaming', 'News', 'Fitness', 'Other'])
        .withMessage('Invalid category'),
    body('nextBillingDate').isISO8601().withMessage('nextBillingDate must be a valid ISO date'),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// GET /api/subscriptions
router.get('/', async (req, res) => {
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });

        // Compute total monthly spend
        const totalMonthlySpend = subscriptions.reduce((acc, sub) => {
            return acc + (sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost);
        }, 0);

        res.json({
            success: true,
            count: subscriptions.length,
            totalMonthlySpend: parseFloat(totalMonthlySpend.toFixed(2)),
            data: subscriptions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/subscriptions
router.post('/', validateSubscription, handleValidationErrors, async (req, res) => {
    try {
        const { name, cost, billingCycle, category, nextBillingDate, color } = req.body;
        const subscription = await Subscription.create({
            name,
            cost,
            billingCycle,
            category,
            nextBillingDate,
            color,
        });
        res.status(201).json({ success: true, data: subscription });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// PUT /api/subscriptions/:id
router.put(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid subscription ID'), ...validateSubscription],
    handleValidationErrors,
    async (req, res) => {
        try {
            const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!subscription) {
                return res.status(404).json({ success: false, message: 'Subscription not found' });
            }
            res.json({ success: true, data: subscription });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    }
);

// DELETE /api/subscriptions/:id
router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid subscription ID')],
    handleValidationErrors,
    async (req, res) => {
        try {
            const subscription = await Subscription.findByIdAndDelete(req.params.id);
            if (!subscription) {
                return res.status(404).json({ success: false, message: 'Subscription not found' });
            }
            res.json({ success: true, message: 'Subscription removed' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    }
);

module.exports = router;
