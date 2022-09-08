import Review from "../model/reviewModel.js";
import { catchAsync } from "../utils/async.js";

export const createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    review,
  });
});

export const getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();
  res.status(200).json({
    status: "success",
    length: review.length,
    review,
  });
});
