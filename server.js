import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
import sportsNewsRoutes from "./routes/sportsNewsRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Example: Fetch all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ Mount sports news routes
app.use("/sports-news", sportsNewsRoutes);
app.use("/announcements", announcementRoutes);








const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
