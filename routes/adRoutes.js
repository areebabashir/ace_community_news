// routes/adRoutes.js
import express from "express";
import {
  createAd,
  getAds,
  getAdById,
  getAdsByClub,
  updateAd,
  submitAdForApproval,
  approveAd,
  rejectAd
} from "../controllers/adController.js";
import { uploadAdsVisuals } from "../middlewares/uploads.js";

const router = express.Router();


// Create a new ad (multipart/form-data)
router.post('/create', uploadAdsVisuals, createAd);

// Get all ads with optional filtering
router.get('/get', getAds);

// Get a specific ad by ID
router.get('/get/:id', getAdById);

// Get ads by club ID
router.get('/get/clubs/:club_id', getAdsByClub);

// Update ad (multipart/form-data optional)
router.put('/update/:id', uploadAdsVisuals, updateAd);

// Status transitions
router.post('/:id/submit', submitAdForApproval); // DRAFT -> PENDING_APPROVAL
router.post('/:id/approve', approveAd); // PENDING_APPROVAL -> APPROVED
router.post('/:id/reject', rejectAd); // PENDING_APPROVAL -> REJECTED

// module.exports = router;

export default router;