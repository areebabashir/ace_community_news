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
  getPublishedClubNews,
  getNewsCountThisMonth
} from "../controllers/clubNewsController.js";
import { uploadClubNewsVisuals } from "../middlewares/uploads.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();

router.post("/create",requireUserType("club", "club_branch"),uploadClubNewsVisuals, createNews);
router.get("/drafts", getDraftNews);
router.get("/club/:clubId/drafts", requireUserType("club", "club_branch"), getDraftNews);
router.get("/published", getPublishedNews);
router.get("/club/:clubId/news", requireUserType("club", "club_branch"), getPublishedClubNews);
router.get("/pending", getPendingNews);
router.get("/rejected", getRejectedNews);
router.get("/club/:clubId/rejected", requireUserType("club", "club_branch"), getRejectedNews);
router.get("/:id", getNewsById);
router.get("/count/:clubId", requireUserType("club", "club_branch"), getNewsCountThisMonth);
router.put("/update/:id",requireUserType("club", "club_branch"), uploadClubNewsVisuals,updateNews);
router.post("/submit/:id",requireUserType("club", "club_branch"), submitForApproval);
router.post("/approve/:id",requireUserType("system_admin"), approveNews);
router.post("/reject/:id",requireUserType("system_admin"), rejectNews);

export default router;
