import { Router, Request, Response } from "express";
import { Service } from "../models/Service.js";
import { Branch } from "../models/Branch.js";

const router = Router();

// ➔ SAVE CUSTOM SERVICES ON ONBOARDING (POST /api/services/setup)
// Supports both ["Code 8", "Code 10"] AND [{ name: "Code 10", price: 4000 }]
router.post("/setup", async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, services } = req.body;

    if (!businessId || !Array.isArray(services) || services.length === 0) {
      res
        .status(400)
        .json({ error: "Missing required onboarding service metrics." });
      return;
    }

    const existingServices = await Service.find({ businessId });
    const existingNames = new Set(
      existingServices.map((s) => s.name.toLowerCase().trim()),
    );

    const normalizedInputs = services
      .map((item: string | { name: string; price?: number }) => {
        if (typeof item === "string") {
          return { name: item.trim(), price: 0 };
        }
        return {
          name: item?.name?.trim() || "",
          price: typeof item?.price === "number" ? Math.max(0, item.price) : 0,
        };
      })
      .filter((item) => item.name !== "");

    const freshServices = normalizedInputs.filter(
      (item) => !existingNames.has(item.name.toLowerCase()),
    );

    if (freshServices.length > 0) {
      const serviceDocuments = freshServices.map((item) => ({
        businessId,
        name: item.name,
        price: item.price,
      }));

      await Service.insertMany(serviceDocuments, { ordered: false });
    }

    const allServices = await Service.find({ businessId });
    res.status(201).json({
      message: "Services configured successfully.",
      services: allServices,
    });
  } catch (error: any) {
    console.error("Service setup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ➔ UPDATE SERVICE PRICE (PATCH /api/services/:serviceId/price)
router.patch(
  "/:serviceId/price",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const { price } = req.body;

      if (typeof price !== "number" || price < 0) {
        res.status(400).json({ error: "Please provide a valid price (>= 0)." });
        return;
      }

      const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { price: Number(price) },
        { new: true },
      );

      if (!updatedService) {
        res.status(404).json({ error: "Service not found." });
        return;
      }

      res.status(200).json({
        message: "Service price updated.",
        service: updatedService,
      });
    } catch (error: any) {
      console.error("Update service price error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ➔ FETCH ALL SERVICES FOR A BRANCH (MUST BE ABOVE /:businessId!)
router.get(
  "/branch/:branchId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { branchId } = req.params;

      const branch = await Branch.findById(branchId);
      if (!branch) {
        res
          .status(404)
          .json({ error: "Target operational branch station not found." });
        return;
      }

      const targetCompanyId = branch.companyId?.toString();
      const lookupIds = targetCompanyId
        ? [branchId, targetCompanyId]
        : [branchId];

      const availableServices = await Service.find({
        businessId: { $in: lookupIds },
      });

      res.status(200).json({ services: availableServices });
    } catch (error: any) {
      console.error("❌ BACKEND CRASH ERROR:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
);

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
