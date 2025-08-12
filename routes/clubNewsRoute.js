// routes/clubNewsRoutes.js
import express from "express";
import {
  createNews,
  getPublishedNews,
  getDraftNews,
  getPendingNews,
  updateNews,
  submitForApproval,
  approveNews,
  rejectNews,
} from "../controllers/clubNewsController.js";
import { uploadClubNewsVisuals } from "../middlewares/uploads.js";

const router = express.Router();

router.post("/create",uploadClubNewsVisuals, createNews);
router.get("/drafts", getDraftNews);
router.get("/published", getPublishedNews);
router.get("/pending", getPendingNews);
router.put("/update/:id", updateNews);
router.post("/submit/:id", submitForApproval);
router.post("/approve/:id", approveNews);
router.post("/reject/:id", rejectNews);

export default router;
