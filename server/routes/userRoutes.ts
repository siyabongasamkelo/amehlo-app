import { Router } from "express";
import {
  syncClerkUser,
  syncStudentUser,
  getUserProfile,
  getBranchStaff,
} from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncClerkUser);
router.post("/sync-student", syncStudentUser);
router.get("/profile/:clerkId", getUserProfile);
router.get("/branch/:branchId/staff", getBranchStaff);

export default router;
