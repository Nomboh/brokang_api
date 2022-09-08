import stripeInstance from "../stripe.js";
import User from "../model/userModel.js";

const createCustomer = async userId => {
  const data = await User.findById(userId);
  const email = data.email;
  const customer = await stripeInstance.customers.create({
    email,
    description: "Customer for " + email,
    metadata: {
      _id: userId,
    },
  });

  await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id });
  return customer;
};

const getCustomer = async userId => {
  const data = await User.findOne({ _id: userId });

  const { stripeCustomerId } = data;
  if (!stripeCustomerId) {
    return createCustomer(userId);
  }

  const customer = await stripeInstance.customers.retrieve(stripeCustomerId);
  return customer;
};

export default getCustomer;
