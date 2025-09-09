// routes/sellerRoutes.js
import express from 'express';
import {
  createSeller,
  getSellerById,
  getAllSellers
} from '../controllers/sellerController.js';

const router = express.Router();

// Create seller
router.post('/', createSeller);

// Get seller by ID
router.get('/:id', getSellerById);

// Get all sellers
router.get('/', getAllSellers);

export default router;