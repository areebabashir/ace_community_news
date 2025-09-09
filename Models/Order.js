// models/Order.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_payment', 'processing', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  payment_method: {
    type: DataTypes.ENUM('card', 'cod', 'bank_transfer'),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  transaction_id: {
    type: DataTypes.STRING(255)
  },
  estimated_delivery: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Order;