import { Router } from "express";
import {
  getCompanyWeeklyReport,
  getCrossBranchAnalytics,
} from "../controllers/analyticsController.js";

const router = Router();

router.get("/company/:companyId/weekly-report", getCompanyWeeklyReport);
router.get("/cross-branch", getCrossBranchAnalytics);

export default router;
