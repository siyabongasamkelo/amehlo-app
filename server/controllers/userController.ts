import { Request, Response } from "express";
import { User } from "../models/User.js";
import { QueueTicket } from "../models/QueueTicket.js"; // Optional: if branch lookups are needed later
import { Branch } from "../models/Branch.js";
import { Enrollment } from "../models/Enrollment.js"; // Add at top of userController.ts
import { clerkClient } from "@clerk/express";

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

// ➔ SEARCH REGISTERED STUDENTS BY COMPANY (GET /api/users/company/:companyId/students?q=...)
export const searchCompanyStudents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { q } = req.query;

    if (!companyId) {
      res.status(400).json({ error: "Missing companyId parameter." });
      return;
    }

    const filter: any = {
      assignedCompanyId: companyId,
      role: "student",
    };

    if (typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const students = await User.find(filter)
      .select("clerkId name email phone assignedCompanyId")
      .limit(10)
      .lean();

    // Attach active enrollment status so desk staff see payment/lesson eligibility
    const clerkIds = students.map((s) => s.clerkId);
    const activeEnrollments = await Enrollment.find({
      studentClerkId: { $in: clerkIds },
      status: "active",
    }).lean();

    const enrollmentMap = new Map(
      activeEnrollments.map((e) => [e.studentClerkId, e]),
    );

    const enrichedStudents = students.map((student) => ({
      ...student,
      enrollment: enrollmentMap.get(student.clerkId) || null,
    }));

    res.status(200).json({ students: enrichedStudents });
  } catch (error: any) {
    console.error("Search company students failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add to userController.ts
export const assignStudentSchool = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const { companyId, branchId } = req.body;

    if (!companyId) {
      res.status(400).json({ error: "Please select a driving school." });
      return;
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId, role: "student" },
      {
        assignedCompanyId: companyId,
        ...(branchId ? { assignedBranchId: branchId } : {}),
      },
      { new: true },
    );

    if (!updatedUser) {
      res.status(404).json({ error: "Student profile not found." });
      return;
    }

    res.status(200).json({ user: updatedUser });
  } catch (error: any) {
    console.error("Assign student school failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ ADMIN / STAFF CREATES A WALK-IN STUDENT DIRECTLY (POST /api/users/admin-create-student)
export const adminCreateStudent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, phone, companyId, branchId } = req.body;

    if (!name || !email || !companyId) {
      res.status(400).json({
        error: "Name, email, and companyId are required to register a student.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if the student already exists in MongoDB
    const existingMongoUser = await User.findOne({ email: normalizedEmail });
    if (existingMongoUser) {
      res.status(200).json({
        message: "Student already exists in database.",
        user: existingMongoUser,
      });
      return;
    }

    // 2. Check if the email already exists in Clerk (e.g., created previously but never synced)
    const existingClerkUsers = await clerkClient.users.getUserList({
      emailAddress: [normalizedEmail],
    });

    let clerkUser = existingClerkUsers.data[0];

    // 3. If not in Clerk yet, create the Clerk account with no password required
    if (!clerkUser) {
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      clerkUser = await clerkClient.users.createUser({
        emailAddress: [normalizedEmail],
        firstName,
        lastName,
        skipPasswordRequirement: true,
        legalAcceptedAt: new Date(), // <-- Add this line
      });
    }

    // 4. Save the new student into MongoDB with the real clerkId
    const newStudent = new User({
      clerkId: clerkUser.id,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      role: "student",
      assignedCompanyId: companyId,
      assignedBranchId: branchId || null,
    });

    await newStudent.save();

    res.status(201).json({
      message: "Walk-in student created successfully.",
      user: newStudent,
    });
  } catch (error: any) {
    console.error("Admin create student error:", error);
    // Surface Clerk validation errors cleanly if any occur
    const clerkErrorMessage =
      error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
    res.status(500).json({
      error: clerkErrorMessage || error.message || "Failed to create student.",
    });
  }
};
