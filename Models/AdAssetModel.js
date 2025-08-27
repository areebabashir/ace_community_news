// models/AdAsset.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Adjust path as needed

const AdAsset = sequelize.define('AdAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ads',
      key: 'id'
    }
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  height: {
    type: DataTypes.INTEGER,
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
  tableName: 'ad_assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AdAsset; 