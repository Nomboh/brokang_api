import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subCategories: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  image: String,
  alias: String,
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
