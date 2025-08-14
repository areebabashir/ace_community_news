import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Tutorial = sequelize.define("Tutorial", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
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
          return { images: [] };
        }
      }
      return value || { images: [] };
    },
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cached_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "tutorials",
  timestamps: false,
});

export default Tutorial;
