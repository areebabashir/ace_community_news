import express from "express";
import {
  createSportsNews,
  getAllSportsNews,
  getSportsNewsById,
  updateSportsNews,
  deleteSportsNews
} from "../controllers/sportsNewsController.js";
import { uploadSportsNewsVisuals } from "../middlewares/uploads.js";


const router = express.Router();

router.post("/create", uploadSportsNewsVisuals, createSportsNews);
router.get("/get", getAllSportsNews);
router.get("/get/:id", getSportsNewsById);
router.put("/put/:id",uploadSportsNewsVisuals, updateSportsNews);
router.delete("/delete/:id", deleteSportsNews);

export default router;
