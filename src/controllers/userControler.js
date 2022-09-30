import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import { catchAsync } from "../utils/async.js";
import { createError } from "../utils/error.js";

const filterBody = body => {
  const filteredBody = {};
  const allowedFields = ["name", "email", "photo"];
  allowedFields.forEach(field => {
    if (body[field]) filteredBody[field] = body[field];
  });
  return filteredBody;
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.currentPassword || req.body.newPassword) {
    return next(createError("This route is not for password update", 400));
  }
  const user = await User.findByIdAndUpdate(req.user.id, filterBody(req.body), {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const follow = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const seller = await User.findById(req.params.id);
  if (req.params.id === req.user.id) {
    return next(createError("You can't follow yourself", 400));
  }

  if (user.followings.includes(req.params.id)) {
    return next(createError("You already follow this user", 400));
  }
  await user.updateOne({ $push: { followings: req.params.id } });
  await seller.updateOne({ $push: { followers: req.user.id } });
  res.status(200).json({
    status: "success",
    message: "You are now following this user",
  });
});

export const unfollow = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const seller = await User.findById(req.params.id);
  if (req.params.id === req.user.id) {
    return next(createError("You can't unfollow yourself", 400));
  }

  if (!user.followings.includes(req.params.id)) {
    return next(createError("You already unfollow this user", 400));
  }
  await user.updateOne({ $pull: { followings: req.params.id } });
  await seller.updateOne({ $pull: { followers: req.user.id } });
  res.status(200).json({
    status: "success",
    message: "You are have  unfollow this user",
  });
});

export const getFollowers = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const users = await User.find({ _id: { $in: user.followers } });

  const followers = users.map(us => us._id);

  const stats = await Product.aggregate([
    {
      $match: {
        userId: { $in: followers },
      },
    },
    {
      $group: {
        _id: "$userId",
        count: { $count: {} },
      },
    },
  ]);

  res.status(200).json({
    length: users.length,
    status: "success",
    users,
    stats,
  });
});

export const getFollowings = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const users = await User.find({ _id: { $in: user.followings } });

  const followings = users.map(us => us._id);

  const stats = await Product.aggregate([
    {
      $match: {
        userId: { $in: followings },
      },
    },
    {
      $group: {
        _id: "$userId",
        count: { $count: {} },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    length: users.length,
    users,
    stats,
  });
});
