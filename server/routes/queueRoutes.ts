import { Router } from "express";
import {
  joinQueue,
  completeTurn,
  skipTurn,
  purgeGhostClient,
  getBranchQueue,
  getBranchQueueAnalytics, // ➔ Import the new analytics function
  verifyStoreArrival,
} from "../controllers/queueController.js";

const router = Router();

router.get("/:branchId", getBranchQueue);
router.get("/:branchId/analytics", getBranchQueueAnalytics); // ➔ 🎯 Mount the analytics endpoint
router.post("/join", joinQueue);
router.post("/:id/skip", skipTurn);
router.post("/:id/complete", completeTurn);
router.delete("/:id/ghost", purgeGhostClient);
// Mount this right below your other route parameters in
router.post("/:id/arrive", verifyStoreArrival);

export default router;
