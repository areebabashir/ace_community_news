// routes/announcementRoutes.js
import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  uploadAnnouncementVisualsOnly,
} from "../controllers/announcementController.js";
import requireUserType from "../middlewares/auth.js";
import { uploadAnnouncementVisuals } from "../middlewares/uploads.js";

const router = express.Router();

// Upload visuals only (returns { images, video } for use in create body). Use before submit for progress UX.
router.post(
  "/upload-visuals",
  requireUserType("system_admin"),
  uploadAnnouncementVisuals,
  uploadAnnouncementVisualsOnly
);

// Create: multipart (files) OR JSON (body.visuals from pre-upload). Multer only when multipart.
const conditionalUpload = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    return uploadAnnouncementVisuals(req, res, next);
  }
  next();
};
router.post(
  "/create",
  requireUserType("system_admin"),
  conditionalUpload,
  createAnnouncement
);
router.get("/get", getAllAnnouncements);
router.get("/get/:id", getAnnouncementById);
router.put("/update/:id",requireUserType("system_admin"), uploadAnnouncementVisuals,updateAnnouncement);
router.delete("/delete/:id",requireUserType("system_admin"), deleteAnnouncement);

export default router;
