// controllers/orderController.js
import { Order, OrderItem, Product } from '../Models/index.js';
import { Op } from 'sequelize';

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      items,
      shipping_address,
      contact_number,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (!user_id || !items || !shipping_address || !contact_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, items, shipping_address, contact_number'
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cod', 'bank_transfer', 'card'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use: cod, bank_transfer, or card'
      });
    }

    // Calculate total amount and validate items
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product_id}`
        });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product: ${product.name}`
        });
      }

      const subtotal = item.quantity * product.price;
      total_amount += subtotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: subtotal
      });
    }

    // Create order
    const order = await Order.create({
      user_id: parseInt(user_id),
      total_amount,
      payment_method,
      payment_status: 'pending',
      status: 'pending_payment',
      shipping_address,
      contact_number,
      notes,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    await OrderItem.bulkCreate(orderItemsWithOrderId);

    // Record status history
    // await OrderStatusHistory.create({
    //   order_id: order.id,
    //   status: 'pending_payment',
    //   notes: 'Order created'
    // });

    // TEMPORARY: Auto-confirm non-card payments
    if (payment_method !== 'card') {
      await order.update({
        payment_status: 'completed',
        status: 'processing'
      });

    //   await OrderStatusHistory.create({
    //     order_id: order.id,
    //     status: 'processing',
    //     notes: `Payment automatically confirmed for ${payment_method}`
    //   });

      // Update product inventory
      for (const item of items) {
        await Product.decrement('inventory', {
          by: item.quantity,
          where: { id: item.product_id }
        });
      }
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'image', 'description']
          }]
        }
        // {
        //   model: OrderStatusHistory,
        //   as: 'status_history',
        //   order: [['created_at', 'DESC']]
        // }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Get Orders by User
const getOrdersByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const whereClause = { user_id: parseInt(user_id) };
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user orders',
      error: error.message
    });
  }
};

// Get All Orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, page = 1, limit = 50 } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (payment_status) whereClause.payment_status = payment_status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'quantity', 'subtotal']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Confirm Payment (Admin)
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, notes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed'
      });
    }

    await order.update({
      payment_status: 'completed',
      status: 'processing',
      transaction_id: transaction_id || order.transaction_id
    });

    // await OrderStatusHistory.create({
    //   order_id: order.id,
    //   status: 'processing',
    //   notes: notes || 'Payment manually confirmed by admin'
    // });

    // Update product inventory
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id }
    });

    for (const item of orderItems) {
      await Product.decrement('inventory', {
        by: item.quantity,
        where: { id: item.product_id }
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: order
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: processing, completed, or cancelled'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({ status });
    // await OrderStatusHistory.create({
    //   order_id: order.id,
    //   status: status,
    //   notes: notes || `Status updated to ${status}`
    // });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // const { reason } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed order'
      });
    }

    await order.update({
      status: 'cancelled',
      payment_status: order.payment_status === 'completed' ? 'refunded' : 'failed'
    });

    // await OrderStatusHistory.create({
    //   order_id: order.id,
    //   status: 'cancelled',
    //   notes: reason || 'Order cancelled by user'
    // });

    // Restore inventory if order was processing
    if (order.status === 'processing') {
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id }
      });

      for (const item of orderItems) {
        await Product.increment('inventory', {
          by: item.quantity,
          where: { id: item.product_id }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

export {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  confirmPayment,
  updateOrderStatus,
  cancelOrder
};