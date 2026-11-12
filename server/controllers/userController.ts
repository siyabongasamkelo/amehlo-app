import { Request, Response } from "express";
import { User } from "../models/User.js";
import { QueueTicket } from "../models/QueueTicket.js"; // Optional: if branch lookups are needed later
import { Branch } from "../models/Branch.js";

// ➔ SYNC OR CREATE CLERK USER PROFILES FOR STAFF/OWNERS (POST /api/users/sync)
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

    // 1. Check if the user already exists in our database
    let user = await User.findOne({ clerkId });

    if (user) {
      res.status(200).json({ message: "Profile synchronized", user });
      return;
    }

    // 2. Resolve Role and Corporate Fields Dynamically
    const isWorker = inviteCode && inviteCode.trim() !== "";
    let assignedBranchId = undefined;
    let assignedCompanyId = undefined;

    if (isWorker) {
      // 🎯 DYNAMIC DB LOOKUP: Match the code string entered by the user (e.g., AMHL-EMP-56)
      const matchingBranch = await Branch.findOne({
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      // 🛑 Guard against fake or typo-ridden invite tokens to block invalid registrations
      if (!matchingBranch) {
        res.status(404).json({
          error:
            "Invalid registration Staff Token. No branch matches this code.",
        });
        return;
      }

      // ⚡ Extract the authentic database references directly from the matched document!
      assignedBranchId = matchingBranch._id.toString();
      assignedCompanyId = matchingBranch.companyId;
    }

    // 3. Persist the fresh profile into our database cluster
    user = new User({
      clerkId,
      name,
      email,
      role: isWorker ? "worker" : "owner",
      assignedCompanyId,
      assignedBranchId,
    });

    await user.save();
    res.status(201).json({ message: "User profile initialized cleanly", user });
  } catch (error: any) {
    console.error("User synchronization crash:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ SYNC OR CREATE DEDICATED STUDENT PROFILE (POST /api/users/sync-student)
export const syncStudentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId, name, email, phone } = req.body;

    if (!clerkId || !name || !email) {
      res
        .status(400)
        .json({ error: "Missing required student registration details." });
      return;
    }

    // 1. Check if the student already exists in our database
    let user = await User.findOne({ clerkId });

    if (user) {
      res.status(200).json({ message: "Student profile synchronized", user });
      return;
    }

    // 2. Persist fresh profile strictly locked to the "student" role
    user = new User({
      clerkId,
      name,
      email,
      phone: phone ? phone.trim() : null,
      role: "student",
    });

    await user.save();
    res
      .status(201)
      .json({ message: "Student profile initialized cleanly", user });
  } catch (error: any) {
    console.error("Student synchronization crash:", error);
    res.status(500).json({ error: error.message });
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
    console.error("Fetch profile failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH ALL FRONTLINE WORKERS LINKED TO A SPECIFIC STATION (GET /api/users/branch/:branchId/staff)
export const getBranchStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { branchId } = req.params;

    // Validate the string context param before running database queries
    if (!branchId) {
      res.status(400).json({
        error: "Missing physical branch identity context query parameter.",
      });
      return;
    }

    // 🎯 Query users collection for active workers assigned explicitly to this location
    // We intentionally exclude owners and students here
    const staffMembers = await User.find({
      assignedBranchId: branchId,
      role: "worker",
    }).select("clerkId name email assignedBranchId"); // Only pick necessary payload metrics to keep it light

    res.status(200).json({ staff: staffMembers });
  } catch (error: any) {
    console.error(
      "❌ [BACKEND ERROR] Failed fetching location staff telemetry:",
      error.message,
    );
    res.status(500).json({ error: error.message });
  }
};
