import { Router, Request, Response } from "express";
import { Service } from "../models/Service.js";
import { Branch } from "../models/Branch.js";

const router = Router();

// ➔ SAVE CUSTOM SERVICES ON ONBOARDING (POST /api/services/setup)
router.post("/setup", async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, services } = req.body; // Expects services: ["Haircut", "Nails"]
    if (!businessId || !Array.isArray(services) || services.length === 0) {
      res
        .status(400)
        .json({ error: "Missing required onboarding service metrics." });
      return;
    }

    // 1. Fetch already existing service entries for this business
    const existingServices = await Service.find({ businessId });
    const existingNames = new Set(
      existingServices.map((s) => s.name.toLowerCase().trim()),
    );

    // 2. Filter out names that are already stored in the database
    const newServiceNames = services.filter(
      (serviceName: string) =>
        !existingNames.has(serviceName.toLowerCase().trim()),
    );

    // 3. If there are fresh, non-duplicate services, safely bulk insert them
    if (newServiceNames.length > 0) {
      const serviceDocuments = newServiceNames.map((serviceName: string) => ({
        businessId,
        name: serviceName.trim(),
      }));

      await Service.insertMany(serviceDocuments, { ordered: false });
    }

    // 4. Always respond with success so the frontend safely advances to /dashboard
    res.status(201).json({ message: "Services configured successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});

// ➔ FETCH ALL SERVICES FOR A BUSINESS (GET /api/services/:businessId)
router.get(
  "/:businessId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { businessId } = req.params;
      const availableServices = await Service.find({ businessId });
      res.status(200).json({ services: availableServices });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/branch/:branchId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log(
        "➔ [HTTP API SUCCESS] Hit targeted services branch fetch line!",
      );
      const { branchId } = req.params;

      const branch = await Branch.findById(branchId);
      if (!branch) {
        res
          .status(404)
          .json({ error: "Target operational branch station not found." });
        return;
      }

      // 🎯 THE PERFECT DATA SYNC MATCH: Read companyId directly as shown in Atlas!
      const rawCompanyId = (branch as any).companyId;

      if (!rawCompanyId) {
        console.log(
          `⚠️ Database Alert: Branch ${branchId} exists but has no attached companyId link!`,
        );
        res.status(200).json({
          services: [],
          message: "Branch has no parent company profile linked yet.",
        });
        return;
      }

      const targetBusinessId = rawCompanyId.toString();
      console.log(
        `➔ Found valid parent company link token footprint: ${targetBusinessId}`,
      );

      // Query your Service collections using the company hex ID string footprint
      const availableServices = await Service.find({
        businessId: targetBusinessId,
      });

      console.log(
        `➔ Successfully sending ${availableServices.length} custom services back to client.`,
      );
      res.status(200).json({ services: availableServices });
    } catch (error: any) {
      console.error("❌ BACKEND CRASH ERROR:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
