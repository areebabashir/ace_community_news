// models/Seller.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Seller = sequelize.define('Seller', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  review_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'sellers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Seller;