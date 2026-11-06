import { Router } from "express";
import {
  syncClerkUser,
  getUserProfile,
} from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncClerkUser);
router.get("/profile/:clerkId", getUserProfile);

export default router;
