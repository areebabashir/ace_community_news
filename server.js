import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
// import ClubNews from "./Models/clubNewsModel.js";
import sportsNewsRoutes from "./routes/sportsNewsRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import clubNewsRoutes from "./routes/clubNewsRoute.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
// import requireUserType from "./middlewares/auth.js";
import adRoutes from "./routes/adRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import Ad from "./Models/AdModel.js";
import { Op } from "sequelize";
import AdAsset from "./Models/AdAssetModel.js";


dotenv.config();

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3001',
    'https://rationally-endless-mammal.ngrok-free.app',
    'https://acecommunity.me',
    'https://www.acecommunity.me',
    'https://ace-website-jyrn.vercel.app',
    'https://acecommunity.vercel.app' ,
    'https://acecommunity-clubportals.vercel.app',// 👈 add this
    'https://adminstaging.acecommunity.me',
    'https://portalstaging.acecommunity.me',
    'https://sitestaging.acecommunity.me'

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'ngrok-skip-browser-warning'
  ],
  optionsSuccessStatus: 200
};
// Middleware
app.use(cors(corsOptions));

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
app.use("/ads", adRoutes);
app.use("/products", productRoutes);
app.use("/sellers", sellerRoutes);
app.use("/categories", categoryRoutes);
app.use("/orders", orderRoutes);
// Safe media proxy (avoid ad-blockers on 'ads' path)
app.get('/media/asset/:id', async (req, res) => {
  try {
    const asset = await AdAsset.findByPk(req.params.id);
    if (!asset || !asset.file_url) {
      return res.status(404).send('File not found');
    }
    const filePath = path.join(__dirname, asset.file_url.replace(/^[\\/]+/, ''));
    return res.sendFile(filePath);
  } catch (e) {
    return res.status(500).send('Failed to load file');
  }
});
app.use("/feedback", feedbackRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/contact", contactRoutes);
// Add this route temporarily 
// app.post('/api/standardize-visuals', async (req, res) => {
//   try {
//     const allNews = await ClubNews.findAll();
//     let updatedCount = 0;
    
//     for (const news of allNews) {
//       let needsUpdate = false;
//       let standardizedVisuals;
      
//       if (typeof news.visuals === 'string' && news.visuals.trim() !== '') {
//         try {
//           // Parse the string to get the actual object
//           standardizedVisuals = JSON.parse(news.visuals);
//           needsUpdate = true;
//         } catch (err) {
//           console.error(`Error parsing visuals for news ID ${news.id}:`, err);
//           standardizedVisuals = { images: [] };
//           needsUpdate = true;
//         }
//       } else if (!news.visuals || news.visuals === '' || news.visuals === '{}') {
//         standardizedVisuals = { images: [] };
//         needsUpdate = true;
//       }
      
//       if (needsUpdate) {
//         // Use raw query to ensure it's stored as JSON, not string
//         await news.sequelize.query(
//           'UPDATE club_news SET visuals = ? WHERE id = ?',
//           {
//             replacements: [JSON.stringify(standardizedVisuals), news.id],
//             type: news.sequelize.QueryTypes.UPDATE
//           }
//         );
//         updatedCount++;
//         console.log(`Updated news ID ${news.id}`);
//       }
//     }
    
//     res.json({
//       message: `Successfully standardized ${updatedCount} records`,
//       updatedCount
//     });
    
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cron: every 30 minutes, activate or expire ads based on dates
cron.schedule("*/1 * * * *", async () => {
  console.log("Cron job started");
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD

    // Activate APPROVED ads whose window includes today
    
    await Ad.update(
      { status: 'ACTIVE' },
      {
        where: {
          status: 'APPROVED',
          start_date: { [Op.lte]: todayStr },
          end_date: { [Op.gte]: todayStr }
        }
      }
    );

    // Expire ACTIVE or APPROVED ads whose end_date is in the past
    await Ad.update(
      { status: 'EXPIRED' },
      {
        where: {
          status: ['APPROVED', 'ACTIVE'],
          end_date: { [Op.lt]: todayStr }
        }
      }
    );

    console.log(`[CRON] Ads status reconciled @ ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[CRON] Error reconciling ads status:', err);
  }
});
