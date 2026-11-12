import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";

// ➔ CREATE NEW STUDENT COURSE ENROLLMENT (POST /api/enrollments)
export const createEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { studentClerkId, goal, code, lessonsCount } = req.body;

    if (!studentClerkId || !goal || !code || !lessonsCount) {
      console.log("Missing required onboarding enrollment details.");
      res.status(400).json({
        error: "Missing required onboarding enrollment details.",
      });
      return;
    }

    // 1. Verify the student exists in our database
    const student = await User.findOne({
      clerkId: studentClerkId,
      role: "student",
    });

    if (!student) {
      (console.log("Student profile not found. Complete registration first."),
        res.status(404).json({
          error: "Student profile not found. Complete registration first.",
        }));
      return;
    }

    // 2. Check if they already have an active enrollment
    const existingActive = await Enrollment.findOne({
      studentClerkId,
      status: "active",
    });

    if (existingActive) {
      // If it's still unpaid, update their selection cleanly instead of creating duplicates
      if (!existingActive.isPaid) {
        existingActive.goal = goal;
        existingActive.code = code.trim();
        existingActive.totalLessons = Number(lessonsCount);
        existingActive.lessonsRemaining = Number(lessonsCount);
        existingActive.lessonsSpent = 0;
        await existingActive.save();

        console.log("Enrollment selection updated");
        res.status(200).json({
          message: "Enrollment selection updated",
          enrollment: existingActive,
        });
        return;
      }

      console.log("You already have an active paid course in progress.");
      res.status(400).json({
        error: "You already have an active paid course in progress.",
      });
      return;
    }

    // 3. Create fresh enrollment locked to isPaid: false until verified
    const enrollment = new Enrollment({
      studentClerkId,
      goal,
      code: code.trim(),
      isPaid: false,
      totalLessons: Number(lessonsCount),
      lessonsSpent: 0,
      lessonsRemaining: Number(lessonsCount),
      status: "active",
    });

    await enrollment.save();
    res.status(201).json({
      message: "Student course enrollment created successfully",
      enrollment,
    });
  } catch (error: any) {
    console.error("Create enrollment failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH ACTIVE ENROLLMENT FOR LOGGED-IN STUDENT (GET /api/enrollments/student/:clerkId)
export const getStudentEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId } = req.params;

    const enrollment = await Enrollment.findOne({
      studentClerkId: clerkId,
      status: "active",
    }).sort({ createdAt: -1 });

    // Return null cleanly if they haven't completed the 3-step onboarding wizard yet
    res.status(200).json({ enrollment: enrollment || null });
  } catch (error: any) {
    console.error("Fetch student enrollment failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ MARK ENROLLMENT AS PAID (PATCH /api/enrollments/:enrollmentId/pay)
export const markEnrollmentPaid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      console.log("Enrollment record not found.");
      res.status(404).json({ error: "Enrollment record not found." });
      return;
    }

    enrollment.isPaid = true;
    await enrollment.save();

    res.status(200).json({
      message: "Payment verified and lessons unlocked",
      enrollment,
    });
  } catch (error: any) {
    console.error("Mark enrollment paid failure:", error);
    res.status(500).json({ error: error.message });
  }
};
