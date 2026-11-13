import { Router } from "express";
import {
  createCompany,
  getOwnerCompanies,
  getCompanyById,
  getAllCompanies,
} from "../controllers/companyController.js";

const router = Router();

router.post("/", createCompany);
router.get("/owner/:ownerId", getOwnerCompanies);
router.get("/:id", getCompanyById); // ➔ Put this AFTER /owner/:ownerId!
router.get("/", getAllCompanies);

export default router;
