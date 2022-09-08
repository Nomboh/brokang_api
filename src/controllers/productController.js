import Product from "../model/productModel.js";
import { catchAsync } from "../utils/async.js";

export const createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    product,
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  // filtering products based on query params
  const queryObj = { ...req.query };
  const excludedFiels = ["page", "sort", "limit", "fields"];
  excludedFiels.forEach(el => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
  let query = Product.find(JSON.parse(queryStr));
  // filtering base on product Names and Tags

  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { tags: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  if (req.query.search) query = query.find(keyword);

  // Sorting products based on query params
  if (req.query.sort) {
    query = query.sort(req.query.sort.split(",").join(" "));
  }

  // fields limiting

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10);
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const products = await query.populate("reviews");
  res.status(200).json({
    status: "success",
    length: products.length,
    products,
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    status: "success",
    product,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    product,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
  });
});

export const getUserProducts = (req, res, next) => {
  const userId = req.user.id;
  req.query.userId = userId;
  next();
};

export const getSellerProducts = catchAsync(async (req, res, next) => {
  req.query.userId = req.params.id;
  req.query.fields = "name,price,images,likes, reviews";
  next();
});

export const recommendedProducts = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  req.query.category = product.category;
  req.query.limit = 20;
  req.query.fields = "name,price,images,likes, reviews, category, tags, userId";
  next();
});

export const getHiddenProducts = (req, res, next) => {
  const userId = req.user.id;
  req.query.userId = userId;
  req.query.state = "hidden";
  next();
};

export const getUserLikedProducts = catchAsync(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { tags: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const userId = req.user.id;
  const products = await Product.find(keyword).find({
    likes: { $in: userId },
  });
  res.status(200).json({
    status: "success",
    length: products.length,
    products,
  });
});

export const toggleLike = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const userId = req.user.id;
  if (product.likes.includes(userId)) {
    await product.updateOne({ $pull: { likes: userId } });
    res.status(200).json({
      status: "success",
      message: "product have been unliked",
    });
  } else {
    await product.updateOne({ $push: { likes: userId } });
    res.status(200).json({
      status: "success",
      message: "product have been liked",
    });
  }
});

export const getSearchProducts = catchAsync(async (req, res, next) => {
  const query = req.query.q;

  const products = await Product.find({
    name: { $regex: query, $options: "i" },
  }).find(req.query);
  res.status(200).json({
    status: "success",
    length: products.length,
    products,
  });
});
