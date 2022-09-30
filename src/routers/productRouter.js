import expree from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getHiddenProducts,
  getProduct,
  getSearchProducts,
  getSellerProducts,
  getUserLikedProducts,
  getUserProducts,
  recommendedProducts,
  toggleLike,
  updateProduct,
  getUserSaleProducts,
} from "../controllers/productController.js";
import { verifyUser } from "../utils/verify.js";

const router = expree.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", getSearchProducts);
router.get("/userProducts", verifyUser, getUserProducts, getAllProducts);
router.get("/userProducts", verifyToken, getUserProducts, getAllProducts);
router.get(
  "/userSaleProducts",
  verifyToken,
  getUserSaleProducts,
  getAllProducts
);
router.get("/sellerProducts/:id", getSellerProducts, getAllProducts);

router.get("/recommendedProducts/:id", recommendedProducts, getAllProducts);
router.get("/hiddenProducts", verifyUser, getHiddenProducts, getAllProducts);
router.get("/userlikedProducts", verifyUser, getUserLikedProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.put("/:id/likes", verifyUser, toggleLike);

export default router;
