import express from "express";
import {
  createSportsNews,
  getAllSportsNews,
  getSportsNewsById,
  updateSportsNews,
  deleteSportsNews
} from "../controllers/sportsNewsController.js";
import { uploadClubNewsVisuals } from "../middlewares/uploads.js";


const router = express.Router();

router.post("/create", uploadClubNewsVisuals, createSportsNews);
router.get("/get", getAllSportsNews);
router.get("/get/:id", getSportsNewsById);
router.put("/put/:id", updateSportsNews);
router.delete("/delete/:id", deleteSportsNews);

export default router;
