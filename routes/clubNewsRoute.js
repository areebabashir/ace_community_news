// routes/clubNewsRoutes.js
import express from "express";
import {
  createNews,
  getPublishedNews,
  getPendingNews,
  updateNews,
  submitForApproval,
  approveNews,
  rejectNews,
} from "../controllers/clubNewsController.js";

const router = express.Router();

router.post("/create", createNews);
router.get("/published", getPublishedNews);
router.get("/pending", getPendingNews);
router.put("/update/:id", updateNews);
router.post("/submit/:id", submitForApproval);
router.post("/approve/:id", approveNews);
router.post("/reject/:id", rejectNews);

export default router;
