const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0.01, 'Cost must be greater than $0'],
    },
    billingCycle: {
      type: String,
      required: [true, 'Billing cycle is required'],
      enum: {
        values: ['monthly', 'yearly'],
        message: 'Billing cycle must be either monthly or yearly',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Streaming',
        'Music',
        'Cloud Storage',
        'SaaS',
        'Gaming',
        'News',
        'Fitness',
        'Other',
      ],
    },
    nextBillingDate: {
      type: Date,
      required: [true, 'Next billing date is required'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Virtual: normalized monthly cost for aggregation
subscriptionSchema.virtual('monthlyCost').get(function () {
  return this.billingCycle === 'yearly' ? this.cost / 12 : this.cost;
});

subscriptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
