import express from "express";
import {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  deleteTutorial,
} from "../controllers/tutorialController.js";
import { uploadTutorialVisuals } from "../middlewares/uploads.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();

router.post("/",requireUserType("system_admin"), uploadTutorialVisuals, createTutorial); // Create
router.get("/", getAllTutorials); // Read all
router.get("/:id", getTutorialById); // Read by ID
router.put("/:id",requireUserType("system_admin"), uploadTutorialVisuals, updateTutorial); // Update
router.delete("/:id",requireUserType("system_admin"), deleteTutorial); // Delete

export default router;
