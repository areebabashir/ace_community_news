import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user_name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  uuu_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(96),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  first_name: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
    allowNull: false,
    defaultValue: "male",
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  user_type: {
    type: DataTypes.ENUM(
      "system_admin",
      "club",
      "club_employee",
      "coach",
      "instructor",
      "player",
      "guest",
      "analytics_manager"
    ),
    allowNull: false,
    defaultValue: "player",
  },
  user_type_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  old_password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  provider_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otp_used_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otp_attempts: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "users",   // Match your DB table
  timestamps: false,    // Already handled by created_at, updated_at manually
});

export default User;
