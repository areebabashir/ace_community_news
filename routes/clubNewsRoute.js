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
  getRejectedNews,
  getNewsById,
  getPublishedClubNews
} from "../controllers/clubNewsController.js";
import { uploadClubNewsVisuals } from "../middlewares/uploads.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();

router.post("/create",requireUserType("club"),uploadClubNewsVisuals, createNews);
router.get("/drafts", getDraftNews);
router.get("/club/:clubId/drafts", requireUserType("club"), getDraftNews);
router.get("/published", getPublishedNews);
router.get("/club/:clubId/news", requireUserType("club"), getPublishedClubNews);
router.get("/pending", getPendingNews);
router.get("/rejected", getRejectedNews);
router.get("/club/:clubId/rejected", requireUserType("club"), getRejectedNews);
router.get("/:id", getNewsById);
router.put("/update/:id",requireUserType("club"), uploadClubNewsVisuals,updateNews);
router.post("/submit/:id",requireUserType("club"), submitForApproval);
router.post("/approve/:id",requireUserType("system_admin"), approveNews);
router.post("/reject/:id",requireUserType("system_admin"), rejectNews);

export default router;
