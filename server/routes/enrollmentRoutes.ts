import { Router } from "express";
import {
  createEnrollment,
  getStudentEnrollment,
  markEnrollmentPaid,
} from "../controllers/enrollmentController.js";

const router = Router();

router.post("/", createEnrollment);
router.get("/student/:clerkId", getStudentEnrollment);
router.patch("/:enrollmentId/pay", markEnrollmentPaid);

export default router;
