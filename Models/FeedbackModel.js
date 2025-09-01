import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Feedback = sequelize.define(
  "Feedback",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    club: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: false,
  }
);

export default Feedback;


