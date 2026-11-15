import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { Service } from "../models/Service.js";

// ➔ CREATE NEW STUDENT COURSE ENROLLMENT (POST /api/enrollments)
export const createEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      studentClerkId,
      serviceId,
      goal,
      code,
      lessonsCount,
      supposedPrice,
      amountPaid,
    } = req.body;

    if (!studentClerkId || !goal || !code || !lessonsCount) {
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
      res.status(404).json({
        error: "Student profile not found. Complete registration first.",
      });
      return;
    }

    // 2. Resolve price from Service catalog if serviceId is passed
    let resolvedPrice =
      typeof supposedPrice === "number" ? Number(supposedPrice) : 0;

    if (serviceId && resolvedPrice === 0) {
      const matchedService = await Service.findById(serviceId).lean();
      if (matchedService && typeof matchedService.price === "number") {
        resolvedPrice = matchedService.price;
      }
    }

    const initialPaid =
      typeof amountPaid === "number" ? Math.max(0, Number(amountPaid)) : 0;
    const fullyPaid =
      resolvedPrice > 0 ? initialPaid >= resolvedPrice : initialPaid > 0;

    // 3. Check if they already have an active enrollment
    const existingActive = await Enrollment.findOne({
      studentClerkId,
      status: "active",
    });

    if (existingActive) {
      // Allow updating if still unpaid OR if all previous lessons are finished
      if (!existingActive.isPaid || existingActive.lessonsRemaining === 0) {
        existingActive.serviceId = serviceId || existingActive.serviceId;
        existingActive.goal = goal;
        existingActive.code = code.trim();
        existingActive.supposedPrice = resolvedPrice;
        existingActive.amountPaid = initialPaid;
        existingActive.isPaid = fullyPaid;
        existingActive.totalLessons = Number(lessonsCount);
        existingActive.lessonsRemaining = Number(lessonsCount);
        existingActive.lessonsSpent = 0;
        await existingActive.save();

        res.status(200).json({
          message: "Enrollment selection updated",
          enrollment: existingActive,
        });
        return;
      }

      res.status(400).json({
        error: "You already have an active paid course in progress.",
      });
      return;
    }

    // 4. Create fresh enrollment with price & payment tracking
    const enrollment = new Enrollment({
      studentClerkId,
      serviceId: serviceId || null,
      goal,
      code: code.trim(),
      supposedPrice: resolvedPrice,
      amountPaid: initialPaid,
      isPaid: fullyPaid,
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

    res.status(200).json({ enrollment: enrollment || null });
  } catch (error: any) {
    console.error("Fetch student enrollment failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ RECORD FULL OR PARTIAL PAYMENT UPDATE (PATCH /api/enrollments/:enrollmentId/payment)
export const updateEnrollmentPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const { additionalAmount, setTotalPaid } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404).json({ error: "Enrollment record not found." });
      return;
    }

    if (typeof setTotalPaid === "number") {
      enrollment.amountPaid = Math.max(0, Number(setTotalPaid));
    } else if (typeof additionalAmount === "number") {
      enrollment.amountPaid = Math.max(
        0,
        enrollment.amountPaid + Number(additionalAmount),
      );
    } else {
      // Fallback if called with no body: mark full supposedPrice as paid
      enrollment.amountPaid =
        enrollment.supposedPrice > 0
          ? enrollment.supposedPrice
          : enrollment.amountPaid;
    }

    enrollment.isPaid =
      enrollment.supposedPrice > 0
        ? enrollment.amountPaid >= enrollment.supposedPrice
        : true;

    await enrollment.save();

    res.status(200).json({
      message: "Payment updated successfully",
      enrollment,
      balanceRemaining: Math.max(
        0,
        enrollment.supposedPrice - enrollment.amountPaid,
      ),
    });
  } catch (error: any) {
    console.error("Update enrollment payment failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ LEGACY FULL-PAY ENDPOINT KEPT FOR COMPATIBILITY (PATCH /api/enrollments/:enrollmentId/pay)
export const markEnrollmentPaid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404).json({ error: "Enrollment record not found." });
      return;
    }

    if (enrollment.supposedPrice > 0 && enrollment.amountPaid === 0) {
      enrollment.amountPaid = enrollment.supposedPrice;
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
