import { Router } from "express";
import {
  syncClerkUser,
  syncStudentUser,
  getUserProfile,
  getBranchStaff,
  searchCompanyStudents,
  assignStudentSchool,
  adminCreateStudent,
  adminCreateWorker, // <-- Import here
} from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncClerkUser);
router.post("/sync-student", syncStudentUser);
router.post("/admin-create-student", adminCreateStudent);
router.post("/admin-create-worker", adminCreateWorker); // <-- Add route here
router.get("/profile/:clerkId", getUserProfile);
router.get("/branch/:branchId/staff", getBranchStaff);
router.get("/company/:companyId/students", searchCompanyStudents);
router.patch("/:clerkId/assign-school", assignStudentSchool);

export default router;
