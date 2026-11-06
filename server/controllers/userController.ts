import { Request, Response } from "express";
import { User } from "../models/User.js";
import { QueueTicket } from "../models/QueueTicket.js"; // Optional: if branch lookups are needed later

// ➔ SYNC OR CREATE CLERK USER PROFILES (POST /api/users/sync)
export const syncClerkUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId, name, email, inviteCode } = req.body;

    if (!clerkId || !name || !email) {
      res
        .status(400)
        .json({ error: "Missing required Clerk alignment metrics." });
      return;
    }

    // 1. Check if the user already exists in our metadata database
    let user = await User.findOne({ clerkId });

    if (user) {
      res.status(200).json({ message: "Profile synchronized", user });
      return;
    }

    // 2. Determine implicit role based on the presence of an Invite Code
    const isWorker = inviteCode && inviteCode.trim() !== "";

    // For your prototype phase, we map it out simply.
    // Later, this will perform an exact match lookup on your Branches table.
    let assignedBranchId = undefined;
    if (isWorker) {
      // Temporary hardcoded logic to match your simulated front-end blueprint values
      assignedBranchId =
        inviteCode.toUpperCase() === "AMHL-RBY-14" ? "br_2" : "br_1";
    }

    // 3. Persist the fresh profile into our cluster
    user = new User({
      clerkId,
      name,
      email,
      role: isWorker ? "worker" : "owner",
      assignedBranchId,
    });

    await user.save();
    res.status(201).json({ message: "User profile initialized cleanly", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

// ➔ GET CURRENT LOGGED IN USER METADATA (GET /api/users/profile/:clerkId)
export const getUserProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ clerkId });

    if (!user) {
      res.status(404).json({ error: "User profile context not found in DB." });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
