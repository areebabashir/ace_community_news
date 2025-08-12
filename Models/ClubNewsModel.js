// models/ClubNews.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ClubNews = sequelize.define("ClubNews", {
  
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  club_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  created_by_role: {
    type: DataTypes.ENUM("Admin", "Subadmin"),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  headline: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visuals: {
    type: DataTypes.JSON, // Array of file URLs
    allowNull: true,
  },
  publish_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("draft", "pending_approval", "published", "rejected"),
    defaultValue: "draft",
    allowNull: false,
  },
  rejection_comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "club_news",
  timestamps: true,
});

export default ClubNews;
