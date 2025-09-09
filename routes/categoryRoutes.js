// routes/categoryRoutes.js
import express from 'express';
import {
  createCategory,
  getCategoryById,
  getAllCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// Create category
router.post('/', createCategory);

// Get category by ID
router.get('/:id', getCategoryById);

// Get all categories
router.get('/', getAllCategories);

export default router;