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
  rejectAd,
  activateAd
} from "../controllers/adController.js";
import { uploadAdsVisuals } from "../middlewares/uploads.js";
import { getPricing, upsertPricing } from "../controllers/adPricingController.js";
import { getListingAvailability } from "../controllers/adListingController.js";
import requireUserType from "../middlewares/auth.js";

const router = express.Router();


// Create a new ad (multipart/form-data)
router.post('/create', uploadAdsVisuals, createAd);

// Get all ads with optional filtering
router.get('/get',requireUsertype("system_admin"), getAds);

// Get a specific ad by ID
router.get('/get/:id', getAdById);

// Get ads by club ID
router.get('/get/clubs/:club_id', getAdsByClub);

// Update ad (multipart/form-data optional)
router.put('/update/:id', uploadAdsVisuals, updateAd);

// Status transitions
router.post('/:id/submit', submitAdForApproval); // DRAFT -> PENDING_APPROVAL
router.post('/:id/approve',requireUserType("system_admin"), approveAd); // PENDING_APPROVAL -> APPROVED
router.post('/:id/reject',requireUserType("system_admin"), rejectAd); // PENDING_APPROVAL -> REJECTED
router.post('/:id/activate', activateAd); // APPROVED -> ACTIVE (adjust start_date if needed)

// Pricing
router.get('/pricing', getPricing);
router.put('/pricing', upsertPricing);

// Listing availability for club listings
router.get('/listing-availability', getListingAvailability);

// module.exports = router;

export default router;