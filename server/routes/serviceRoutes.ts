import { Router, Request, Response } from "express";
import { Service } from "../models/Service.js";

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

    // Format array elements for bulk mongoose insertion
    const serviceDocuments = services.map((serviceName: string) => ({
      businessId,
      name: serviceName,
    }));

    await Service.insertMany(serviceDocuments, { ordered: false }); // ordered: false ignores minor duplicate friction

    res.status(201).json({ message: "Services configured successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

export default router;
