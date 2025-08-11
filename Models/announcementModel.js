// models/announcementModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Announcement = sequelize.define("Announcement", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  external_id: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("announcement", "tutorial"),
    allowNull: false,
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
  thumbnail_url: {
    type: DataTypes.STRING(2083),
    allowNull: true,
  },
  article_url: {
    type: DataTypes.STRING(2083),
    allowNull: false,
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
  tableName: "ace_announcements_cache",
  timestamps: false,
});

export default Announcement;
