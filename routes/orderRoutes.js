// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  confirmPayment,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Create order
router.post('/', createOrder);

// Get order by ID
router.get('/:id', getOrderById);

// Get orders by user
router.get('/users/:user_id', getOrdersByUser);

// Get all orders (admin)
router.get('/', getAllOrders);

// Confirm payment (admin)
router.put('/:id/confirm-payment', confirmPayment);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Cancel order
router.put('/:id/cancel', cancelOrder);

export default router;