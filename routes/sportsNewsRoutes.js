import express from "express";
import {
  createSportsNews,
  getAllSportsNews,
  getSportsNewsById,
  updateSportsNews,
  deleteSportsNews,
  scrapePadelNews,
  scrapeTennisNews,
  scrapePickleballNews,
  scrapeFootballNews,
  scrapeBasketballNews
} from "../controllers/sportsNewsController.js";
import { uploadSportsNewsVisuals } from "../middlewares/uploads.js";
import requireUserType from "../middlewares/auth.js";


const router = express.Router();

router.post("/create",requireUserType("system_admin"), uploadSportsNewsVisuals, createSportsNews);
router.get("/get", getAllSportsNews);
router.get("/get/:id", getSportsNewsById);
router.put("/update/:id",requireUserType("system_admin"), uploadSportsNewsVisuals, updateSportsNews);
router.delete("/delete/:id",requireUserType("system_admin"), deleteSportsNews);
router.post("/scrapepadelnews",/* requireUserType("system_admin"),*/ scrapePadelNews);
router.post("/scrapetennisnews",/* requireUserType("system_admin"),*/ scrapeTennisNews);
router.post("/scrapepickleballnews",/* requireUserType("system_admin"),*/ scrapePickleballNews);
router.post("/scrapefootballnews",/* requireUserType("system_admin"),*/ scrapeFootballNews);
router.post("/scrapebasketballnews",/* requireUserType("system_admin"),*/ scrapeBasketballNews);

export default router;
