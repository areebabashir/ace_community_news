import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AdPricing = sequelize.define('AdPricing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ad_type: {
    type: DataTypes.ENUM('APP_BANNER', 'WEBSITE_BANNER', 'CLUB_LISTING'),
    allowNull: false
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true // null for banners; 1-5 for club listing
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ad_pricing',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['ad_type', 'rank'] }
  ]
});

export default AdPricing;





