import { Router } from "express";
import {
  createBranch,
  getCompanyBranches,
  verifyInviteCode,
} from "../controllers/branchController.js";

const router = Router();

router.post("/", createBranch);
router.get("/company/:companyId", getCompanyBranches);
router.get("/verify/:inviteCode", verifyInviteCode);

export default router;
