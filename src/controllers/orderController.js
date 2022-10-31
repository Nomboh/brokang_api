import Order from "../model/order.js";
import { catchAsync } from "../utils/async.js";

export const getOrder = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const orders = await Order.find({ userId }).sort("-createdAt");
  res.status(200).json(orders);
});
