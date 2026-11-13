import { Router } from "express";
import {
  joinQueue,
  completeTurn,
  skipTurn,
  purgeGhostClient,
  getBranchQueue,
  getBranchQueueAnalytics,
  verifyStoreArrival,
  startService,
  getStudentActiveTicket,
  getStudentLessonHistory,
} from "../controllers/queueController.js";

const router = Router();

router.get("/student/:clerkId/history", getStudentLessonHistory); // ➔ Must come BEFORE /:branchId!
router.get("/student/:clerkId", getStudentActiveTicket);
router.get("/:branchId", getBranchQueue);
router.get("/:branchId/analytics", getBranchQueueAnalytics);
router.post("/join", joinQueue);
router.post("/:id/skip", skipTurn);
router.post("/:id/complete", completeTurn);
router.delete("/:id/ghost", purgeGhostClient);
router.post("/:id/arrive", verifyStoreArrival);
router.post("/:id/start", startService);

export default router;
