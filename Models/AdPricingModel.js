import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AdPricing = sequelize.define(
  "AdPricing",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ad_type: {
      type: DataTypes.ENUM("APP_BANNER", "WEBSITE_BANNER", "CLUB_LISTING"),
      allowNull: false,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ad_pricing",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["ad_type"],
      },
    ],
  }
);

export default AdPricing;
