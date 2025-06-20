import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
      appInfo: {
        name: 'Leaderboard Saas',
        version: '0.1.0',
      },
    })
  : {
      // Add mock methods as needed for your app
      charges: { create: async () => { throw new Error('Stripe not configured'); } },
      paymentIntents: { create: async () => { throw new Error('Stripe not configured'); } },
      // ...add more mocks if your app uses other Stripe features
    } as any; 