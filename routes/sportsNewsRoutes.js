import express from "express";
import {
  createSportsNews,
  getAllSportsNews,
  getSportsNewsById,
  updateSportsNews,
  deleteSportsNews
} from "../controllers/sportsNewsController.js";
import { uploadSportsNewsVisuals } from "../middlewares/uploads.js";
import requireUserType from "../middlewares/auth.js";


const router = express.Router();

router.post("/create",requireUserType("system_admin"), uploadSportsNewsVisuals, createSportsNews);
router.get("/get", getAllSportsNews);
router.get("/get/:id", getSportsNewsById);
router.put("/update/:id",requireUserType("system_admin"), uploadSportsNewsVisuals, updateSportsNews);
router.delete("/delete/:id",requireUserType("system_admin"), deleteSportsNews);

export default router;
