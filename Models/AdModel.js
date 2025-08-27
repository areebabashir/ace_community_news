// models/Ad.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Adjust path as needed

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  club_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ad_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  branchname: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ad_type: {
    type: DataTypes.ENUM('APP_BANNER', 'WEBSITE_BANNER', 'CLUB_LISTING'),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('CARD', 'CASH'),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'PAID'),
    defaultValue: 'PENDING'
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'EXPIRED', 'REJECTED'),
    defaultValue: 'DRAFT'
  },
  listing_position: {
    type: DataTypes.TINYINT,
    allowNull: true
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
  tableName: 'ads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (ad) => {
      // Calculate end_date if start_date and duration_days are provided
      if (ad.start_date && ad.duration_days) {
        const startDate = new Date(ad.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + ad.duration_days);
        ad.end_date = endDate.toISOString().split('T')[0];
      }
      
      // Calculate total_budget if price_per_day and duration_days are provided
      if (ad.price_per_day && ad.duration_days) {
        ad.total_budget = parseFloat(ad.price_per_day) * ad.duration_days;
      }
    },
    beforeUpdate: (ad) => {
      // Recalculate end_date and total_budget if relevant fields are updated
      if (ad.changed('start_date') || ad.changed('duration_days')) {
        const startDate = new Date(ad.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + ad.duration_days);
        ad.end_date = endDate.toISOString().split('T')[0];
      }
      
      if (ad.changed('price_per_day') || ad.changed('duration_days')) {
        ad.total_budget = parseFloat(ad.price_per_day) * ad.duration_days;
      }
    }
  }
});

export default Ad;