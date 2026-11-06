import { Router } from "express";
import {
  joinQueue,
  completeTurn,
  skipTurn,
  purgeGhostClient,
  getBranchQueue,
} from "../controllers/queueController.js";

const router = Router();

router.get("/:branchId", getBranchQueue);
router.post("/join", joinQueue);
router.post("/:id/skip", skipTurn);
router.post("/:id/complete", completeTurn);
router.delete("/:id/ghost", purgeGhostClient);

export default router;
