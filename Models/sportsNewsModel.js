// Updated sportsNewsModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SportsNews = sequelize.define("SportsNews", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  headline: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    indexes: true,
  },
  cached_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    indexes: true,
  },
  visuals: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const value = this.getDataValue('visuals');
      // Ensure we always return an object
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return { images: [] };
        }
      }
      return value || { images: [] };
    }
  },
  category: {
    type: DataTypes.ENUM('padel', 'tennis', 'pickleball', 'football', 'basketball'),
    allowNull: true,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: "sports_news_cache",
  timestamps: false,
});

export default SportsNews;