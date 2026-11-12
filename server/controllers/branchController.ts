import { Request, Response } from "express";
import { Branch } from "../models/Branch.js";

// ➔ PROVISION NEW PHYSICAL BRANCH (POST /api/branches)
export const createBranch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, phone, companyId } = req.body;

    if (!name || !phone || !companyId) {
      res.status(400).json({
        error: "Missing branch naming, phone metrics, or company parent ID.",
      });
      return;
    }

    // ⚡ AUTOMATED STAFF TOKEN GENERATOR ENGINE
    // Takes the first 3 characters of the name uppercase and appends a rolling 2-digit token
    const slug = name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "X");
    const uniqueNumber = Math.floor(10 + Math.random() * 90);
    const generatedToken = `AMHL-${slug}-${uniqueNumber}`;

    const newBranch = new Branch({
      name,
      phone,
      companyId,
      inviteCode: generatedToken,
    });

    await newBranch.save();
    res.status(201).json({
      message: "Physical branch node cluster activated cleanly",
      branch: newBranch,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH ALL BRANCHES UNDER A CORPORATE COMPANY (GET /api/branches/company/:companyId)
export const getCompanyBranches = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const branches = await Branch.find({ companyId }).sort({ createdAt: 1 });
    res.status(200).json({ branches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ VALIDATE INVITE CODE FOR FRONTLINE WORKERS (GET /api/branches/verify/:inviteCode)
export const verifyInviteCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { inviteCode } = req.params;

    // 🎯 THE FIX: Force explicit string narrowing guard clause
    if (typeof inviteCode !== "string") {
      res
        .status(400)
        .json({ error: "Malformed operational invite code parameter format." });
      return;
    }

    const branch = await Branch.findOne({
      inviteCode: inviteCode.toUpperCase().trim(),
    });

    if (!branch) {
      res
        .status(404)
        .json({ error: "Invalid operational Staff Token code string." });
      return;
    }
    res
      .status(200)
      .json({ message: "Staff token code successfully cleared", branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 🎯 LOOKUP PHYSICAL BRANCH VIA PHONE NUMBER (GET /api/branches/search/phone)
export const getBranchByPhone = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { phone } = req.query;

    if (!phone || typeof phone !== "string") {
      res
        .status(400)
        .json({ error: "Missing or malformed phone query parameter." });
      return;
    }

    // ⚡ SANITIZATION ENGINE: Strip common layout characters to ensure match integrity
    const sanitizedSearchPhone = phone.replace(/[^0-9+]/g, "");

    // Fetch all branches to compare sanitized database fields cleanly
    const branches = await Branch.find({});

    const matchedBranch = branches.find((branch) => {
      const dbSanitized = branch.phone.replace(/[^0-9+]/g, "");
      return (
        dbSanitized === sanitizedSearchPhone ||
        dbSanitized.endsWith(sanitizedSearchPhone)
      );
    });

    if (!matchedBranch) {
      res.status(404).json({
        error: "No active queue terminal found matching this phone number.",
      });
      return;
    }

    res.status(200).json({ branch: matchedBranch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH SINGLE PHYSICAL BRANCH NODE BY ID (GET /api/branches/:id)
export const getBranchById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // 🎯 Guard clause: Verify it's a valid MongoDB ObjectId before querying
    if (!id || id.length !== 24) {
      res.status(400).json({ error: "Malformed branch identity reference." });
      return;
    }

    const branch = await Branch.findById(id);

    if (!branch) {
      res.status(404).json({ error: "Physical station terminal not found." });
      return;
    }

    res.status(200).json({ branch });
  } catch (error: any) {
    console.error("Fetch single branch failure:", error);
    res.status(500).json({ error: error.message });
  }
};
