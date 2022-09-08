import stripe from "stripe";

const stripeInstance = new stripe(process.env.STRIPE_SECRET);

export default stripeInstance;
