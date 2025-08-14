import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Announcement = sequelize.define(
  "Announcement",
  {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reading_time: {
      type: DataTypes.STRING(50),
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
      defaultValue: {},
      get() {
        const value = this.getDataValue("visuals");
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return { images: [], videos: [] };
          }
        }
        return value || { images: [], videos: [] };
      },
    },
  },
  {
    tableName: "ace_announcements_cache",
    timestamps: false,
  }
);

export default Announcement;
