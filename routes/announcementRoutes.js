// routes/announcementRoutes.js
import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";
import requireUserType from "../middlewares/auth.js";
import { uploadAnnouncementVisuals } from "../middlewares/uploads.js";


const router = express.Router();

router.post("/create",requireUserType("system_admin"),uploadAnnouncementVisuals ,createAnnouncement);
router.get("/get", getAllAnnouncements);
router.get("/get/:id", getAnnouncementById);
router.put("/update/:id",requireUserType("system_admin"), uploadAnnouncementVisuals,updateAnnouncement);
router.delete("/delete/:id",requireUserType("system_admin"), deleteAnnouncement);

export default router;
