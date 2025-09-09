// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getPublishedProducts,
  getProductsBySeller,
  getProductById,
  deleteProduct,
  getProductsByCategory
} from '../controllers/productController.js';
import { uploadProductVisuals } from '../middlewares/uploads.js'; 

const router = express.Router();

// Create product (with file upload)
router.post('/', uploadProductVisuals, createProduct);

// Update product (with file upload)
router.put('/:id', uploadProductVisuals, updateProduct);

// Get all products
router.get('/', getAllProducts);

// Get published products with filters
router.get('/published', getPublishedProducts);

// Get products by seller with filters
router.get('/sellers/:seller_id/products', getProductsBySeller);

// Get single product
router.get('/:id', getProductById);

// Delete product
router.delete('/:id', deleteProduct);

// Get products by category
router.get('/categories/:category_id/products', getProductsByCategory);

export default router;