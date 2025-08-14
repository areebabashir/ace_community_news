// routes/announcementRoutes.js
import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";
import { uploadAnnouncementVisuals } from "../middlewares/uploads.js";


const router = express.Router();

router.post("/create",uploadAnnouncementVisuals ,createAnnouncement);
router.get("/get", getAllAnnouncements);
router.get("/get/:id", getAnnouncementById);
router.put("/update/:id", uploadAnnouncementVisuals,updateAnnouncement);
router.delete("/delete/:id", deleteAnnouncement);

export default router;
