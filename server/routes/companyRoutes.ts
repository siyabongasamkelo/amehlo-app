import { Router } from "express";
import {
  createCompany,
  getOwnerCompanies,
} from "../controllers/companyController.js";

const router = Router();

router.post("/", createCompany);
router.get("/owner/:ownerId", getOwnerCompanies);

export default router;
