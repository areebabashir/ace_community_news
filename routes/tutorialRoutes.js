import express from "express";
import {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  deleteTutorial,
} from "../controllers/tutorialController.js";
import { uploadClubNewsVisuals } from "../middlewares/uploads.js";

const router = express.Router();

router.post("/", uploadClubNewsVisuals, createTutorial); // Create
router.get("/", getAllTutorials); // Read all
router.get("/:id", getTutorialById); // Read by ID
router.put("/:id", uploadClubNewsVisuals, updateTutorial); // Update
router.delete("/:id", deleteTutorial); // Delete

export default router;
