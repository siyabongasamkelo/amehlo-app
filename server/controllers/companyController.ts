import { Request, Response } from "express";
import { Company } from "../models/Company.js";

// ➔ CREATE NEW COMPANY (POST /api/companies)
export const createCompany = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, ownerId } = req.body;

    if (!name || !ownerId) {
      res
        .status(400)
        .json({ error: "Missing company name or owner validation metrics." });
      return;
    }

    const newCompany = new Company({ name, ownerId });
    await newCompany.save();

    res
      .status(201)
      .json({
        message: "Company profile provisioned successfully",
        company: newCompany,
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH OWNER'S COMPANIES (GET /api/companies/owner/:ownerId)
export const getOwnerCompanies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ownerId } = req.params;
    const companies = await Company.find({ ownerId });
    res.status(200).json({ companies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
