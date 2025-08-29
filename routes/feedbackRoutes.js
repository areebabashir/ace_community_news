import express from "express";
import { createFeedback, listFeedback } from "../controllers/feedbackController.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();

// Public endpoint to submit feedback
router.post("/create", createFeedback);

// Admin-only endpoint to list feedback
router.get("/get-feedback", requireUserType("system_admin"), listFeedback);

export default router;

 
