import { Router } from "express";
import {
  createEnrollment,
  getStudentEnrollment,
  markEnrollmentPaid,
  updateEnrollmentPayment,
} from "../controllers/enrollmentController.js";

const router = Router();

router.post("/", createEnrollment);
router.get("/student/:clerkId", getStudentEnrollment);
router.patch("/:enrollmentId/pay", markEnrollmentPaid);
router.patch("/:enrollmentId/payment", updateEnrollmentPayment);

export default router;
