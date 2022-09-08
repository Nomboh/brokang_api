import Category from "../model/productCategory.js";
import { catchAsync } from "../utils/async.js";

export const createCategory = catchAsync(async (req, res) => {
  const { name, subCategories } = req.body;

  const category = await Category.create({ name, subCategories });
  res.status(201).json({
    status: "success",
    category,
  });
});

export const getAllCategories = catchAsync(async (req, res) => {
  const name = req.query;
  const categories = await Category.find(name ? req.query : {});
  res.status(200).json({
    status: "success",
    categories,
  });
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.status(200).json({
    status: "success",
    category,
  });
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    category,
  });
});

export const deleteCategory = catchAsync(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});
