import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SportsNews = sequelize.define("SportsNews", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  external_id: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  headline: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  thumbnail_url: {
    type: DataTypes.STRING(2083),
    allowNull: true,
  },
  article_url: {
    type: DataTypes.STRING(2083),
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING(100),
    defaultValue: "ace",
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cached_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  raw_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "sports_news_cache",
  timestamps: false, // since cached_at is handled by DB
});

export default SportsNews;
