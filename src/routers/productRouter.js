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
import { verifyUser, verifyToken } from "../utils/verify.js";

const router = expree.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", getSearchProducts);
router.get("/userProducts", verifyToken, getUserProducts, getAllProducts);
router.get(
  "/userSaleProducts",
  verifyToken,
  getUserSaleProducts,
  getAllProducts
);
router.get("/sellerProducts/:id", getSellerProducts, getAllProducts);

router.get("/recommendedProducts/:id", recommendedProducts, getAllProducts);
router.get("/hiddenProducts", verifyToken, getHiddenProducts, getAllProducts);
router.get("/userlikedProducts", verifyToken, getUserLikedProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.put("/:id/likes", verifyToken, toggleLike);

export default router;
