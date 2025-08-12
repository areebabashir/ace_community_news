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
  },
  cached_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  visuals: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "sports_news_cache",
  timestamps: false,
});

export default SportsNews;