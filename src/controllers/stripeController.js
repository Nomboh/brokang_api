import stripeInstance from "../stripe.js";
import { catchAsync } from "../utils/async.js";
import getCustomer from "../utils/getCustomer.js";
import { createError } from "../utils/error.js";

const webHookHandlers = {
  "checkout.session.completed": data => {
    console.log("Checkout session completed", data);
    //other business logic
  },

  "payment_intent.succeeded": data => {
    console.log("Payment intent succeeded", data);
    //other business logic
  },

  "payment_intent.payment_failed": data => {
    console.log("Payment intent failed", data);
    //other business logic
  },
};

const calAmout = item => {
  const shipping =
    item.shipping[0].deliveryFee === "free Shipping"
      ? 0
      : parseInt(item.shipping[0].deliveryFee);

  return item.price + shipping;
};

export const webhook = (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req["rawBody"],
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(event);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (webHookHandlers[event.type]) {
    webHookHandlers[event.type](event.data.object);
  }
};

export const updatePaymentIntent = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { paymentIntentId, paymentMethodId } = req.body;

  const customer = await getCustomer(id);

  const paymentIntent = await stripeInstance.paymentIntents.update(
    paymentIntentId,
    {
      customer: customer.id,
      confirm: true,
      payment_method: paymentMethodId,
    }
  );

  res.status(200).json({ clientSecret: paymentIntent.client_secret });
});

export const setupIntent = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const customer = await getCustomer(id);

  const setupIntents = await stripeInstance.setupIntents.create({
    customer: customer.id,
  });

  res.status(200).json(setupIntents);
});

// payment intent to save a card
export const paymentIntent = catchAsync(async (req, res, next) => {
  const customer = await getCustomer(req.user.id);

  const { item, description, receipt_email, shipping } = req.body;

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: parseInt(calAmout(item)),
    currency: "krw",
    description,
    metadata: {
      image: item.images[0],
    },
    payment_method_types: ["card"],
    receipt_email,
    shipping,
    setup_future_usage: "off_session",
    customer: customer.id,
  });
  res
    .status(200)
    .json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
});

// Normal payment intent

export const paymentIntentNormal = catchAsync(async (req, res, next) => {
  const customer = await getCustomer(req.user.id);

  const { item, description, receipt_email, shipping } = req.body;

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: parseInt(calAmout(item)),
    currency: "krw",
    description,
    metadata: {
      image: item.images[0],
    },
    payment_method_types: ["card"],
    receipt_email,
    shipping,
    customer: customer.id,
  });
  res
    .status(200)
    .json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
});

// payment intent for a saved  card
export const paymentIntentSaved = catchAsync(async (req, res, next) => {
  const customer = await getCustomer(req.user.id);

  const { item, description, receipt_email, shipping, payment_method_id } =
    req.body;

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: parseInt(calAmout(item)),
    currency: "krw",
    description,
    receipt_email,
    metadata: {
      image: item.images[0],
    },
    shipping,
    customer: customer.id,
    payment_method: payment_method_id,
    off_session: true,
    confirm: true,
  });
  res
    .status(200)
    .json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
});

export const getCards = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const customer = await getCustomer(id);

  const cards = await stripeInstance.paymentMethods.list({
    customer: customer.id,
    type: "card",
  });

  res.status(200).json(cards.data);
});

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const domainUrl = process.env.APP_URL;
  const { line_items, customer_email } = req.body;

  if (!line_items || !customer_email) {
    return next(
      new createError("Please provide line_items and customer_email", 400)
    );
  }

  let session;

  session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainUrl}/cancel`,
    customer_email,
    shipping_address_collection: { allowed_countries: ["US", "CA", "KR"] },
  });

  res.status(200).json({ sessionId: session.id });
});

export const renderMe = (req, res, next) => {
  res.status(200).send("Hello world");
};
