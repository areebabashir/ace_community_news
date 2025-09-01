import express from "express";
import { createFeedback, listFeedback, deleteFeedback } from "../controllers/feedbackController.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();

// Public endpoint to submit feedback
router.post("/create", createFeedback);

// Admin-only endpoint to list feedback
router.get("/get-feedback", requireUserType("system_admin"), listFeedback);

// Admin-only endpoint to delete feedback
router.delete("/delete/:id", requireUserType("system_admin"), deleteFeedback);

export default router;

 
