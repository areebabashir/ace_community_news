// models/Product.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(500)
  },
  inventory: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  condition: {
    type: DataTypes.ENUM('new', 'used'),
    defaultValue: 'new'
  },
  listing_visibility: {
    type: DataTypes.ENUM('draft', 'active', 'sold'),
    defaultValue: 'draft'
  },
  payment_method: {
    type: DataTypes.ENUM('card', 'cod', 'both'),
    defaultValue: 'both'
  },
  delivery_methods: {
    type: DataTypes.ENUM('pickup', 'delivery', 'both'),
    defaultValue: 'both'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Product;