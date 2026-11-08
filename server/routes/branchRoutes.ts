import { Router } from "express";
import {
  createBranch,
  getCompanyBranches,
  verifyInviteCode,
  getBranchByPhone,
} from "../controllers/branchController.js";

const router = Router();

router.post("/", createBranch);
router.get("/company/:companyId", getCompanyBranches);
router.get("/verify/:inviteCode", verifyInviteCode);
router.get("/search/phone", getBranchByPhone);

export default router;
