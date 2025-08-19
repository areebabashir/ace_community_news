import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
import ClubNews from "./models/clubNewsModel.js";
import sportsNewsRoutes from "./routes/sportsNewsRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import clubNewsRoutes from "./routes/clubNewsRoute.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
import requireUserType from "./middlewares/auth.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// ✅ Mount routes
app.use("/sports-news", sportsNewsRoutes);
app.use("/announcements", announcementRoutes);
app.use("/club-news", clubNewsRoutes);
app.use("/tutorials", tutorialRoutes);
// Add this route temporarily
app.post('/api/standardize-visuals', async (req, res) => {
  try {
    const allNews = await ClubNews.findAll();
    let updatedCount = 0;
    
    for (const news of allNews) {
      let needsUpdate = false;
      let standardizedVisuals;
      
      if (typeof news.visuals === 'string' && news.visuals.trim() !== '') {
        try {
          // Parse the string to get the actual object
          standardizedVisuals = JSON.parse(news.visuals);
          needsUpdate = true;
        } catch (err) {
          console.error(`Error parsing visuals for news ID ${news.id}:`, err);
          standardizedVisuals = { images: [] };
          needsUpdate = true;
        }
      } else if (!news.visuals || news.visuals === '' || news.visuals === '{}') {
        standardizedVisuals = { images: [] };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // Use raw query to ensure it's stored as JSON, not string
        await news.sequelize.query(
          'UPDATE club_news SET visuals = ? WHERE id = ?',
          {
            replacements: [JSON.stringify(standardizedVisuals), news.id],
            type: news.sequelize.QueryTypes.UPDATE
          }
        );
        updatedCount++;
        console.log(`Updated news ID ${news.id}`);
      }
    }
    
    res.json({
      message: `Successfully standardized ${updatedCount} records`,
      updatedCount
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));