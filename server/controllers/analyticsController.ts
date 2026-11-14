import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Enrollment } from "../models/Enrollment.js";
import { CompletionLog } from "../models/QueueTicket.js";
import { Branch } from "../models/Branch.js";

// Helper: Calculate Monday 00:00:00 of the current week to next Monday 00:00:00
const getMondayToMondayRange = (startQuery?: string, endQuery?: string) => {
  if (startQuery && endQuery) {
    return {
      start: new Date(startQuery),
      end: new Date(endQuery),
    };
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7); // Next Monday 00:00:00

  return { start, end };
};

// ➔ OWNER MONDAY-TO-MONDAY REPORT (GET /api/analytics/company/:companyId/weekly-report)
export const getCompanyWeeklyReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;

    if (!companyId) {
      res.status(400).json({ error: "Missing companyId parameter." });
      return;
    }

    const { start, end } = getMondayToMondayRange(
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
    );

    // 1. Fetch all branches belonging to this company for name lookups & log filtering
    const branches = await Branch.find({ companyId }).lean();
    const branchIds = branches.map((b) => b._id.toString());
    const branchMap = new Map(branches.map((b) => [b._id.toString(), b.name]));

    // ---------------------------------------------------------
    // REPORT 1: NEW STUDENTS JOINED (MONDAY TO MONDAY)
    // ---------------------------------------------------------
    const newStudents = await User.find({
      assignedCompanyId: companyId,
      role: "student",
      createdAt: { $gte: start, $lt: end },
    })
      .sort({ createdAt: -1 })
      .lean();

    const newStudentClerkIds = newStudents.map((s) => s.clerkId);
    const newStudentEnrollments = await Enrollment.find({
      studentClerkId: { $in: newStudentClerkIds },
    }).lean();

    const enrollmentByClerkId = new Map(
      newStudentEnrollments.map((e) => [e.studentClerkId, e]),
    );

    const registeredLearnersList = newStudents.map((student) => {
      const enrollment = enrollmentByClerkId.get(student.clerkId);
      return {
        _id: student._id,
        clerkId: student.clerkId,
        name: student.name,
        email: student.email,
        phone: student.phone || null,
        branchName: student.assignedBranchId
          ? branchMap.get(student.assignedBranchId) || "Main Branch"
          : "Unassigned",
        goal: enrollment?.goal || null,
        code: enrollment?.code || "Not Enrolled",
        isPaid: enrollment?.isPaid ?? false,
        totalLessons: enrollment?.totalLessons ?? 0,
        lessonsSpent: enrollment?.lessonsSpent ?? 0,
        lessonsRemaining: enrollment?.lessonsRemaining ?? 0,
        joinedAt: student.createdAt,
      };
    });

    // ---------------------------------------------------------
    // REPORT 2: COMPLETED LESSONS LOG (MONDAY TO MONDAY)
    // ---------------------------------------------------------
    const completedLogs = await CompletionLog.find({
      branchId: { $in: branchIds },
      completedAt: { $gte: start, $lt: end },
    })
      .sort({ completedAt: -1 })
      .lean();

    // Collect all unique student & instructor clerkIds to resolve names in one query
    const involvedClerkIds = Array.from(
      new Set([
        ...completedLogs
          .map((log) => log.studentClerkId)
          .filter((id): id is string => Boolean(id)),
        ...completedLogs.map((log) => log.servedById),
      ]),
    );

    const [involvedUsers, logEnrollments] = await Promise.all([
      User.find({ clerkId: { $in: involvedClerkIds } })
        .select("clerkId name role")
        .lean(),
      Enrollment.find({ studentClerkId: { $in: involvedClerkIds } })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const userMap = new Map(involvedUsers.map((u) => [u.clerkId, u.name]));
    const codeMap = new Map<string, { code: string; goal: string }>();
    for (const enr of logEnrollments) {
      if (!codeMap.has(enr.studentClerkId)) {
        codeMap.set(enr.studentClerkId, { code: enr.code, goal: enr.goal });
      }
    }

    const completedLessonsList = completedLogs.map((log) => {
      const courseInfo = log.studentClerkId
        ? codeMap.get(log.studentClerkId)
        : undefined;

      return {
        _id: log._id,
        ticketId: log.ticketId,
        studentClerkId: log.studentClerkId || null,
        studentName: log.studentClerkId
          ? userMap.get(log.studentClerkId) || "Walk-In Student"
          : "Walk-In Student",
        code: courseInfo?.code || "Standard Lesson",
        goal: courseInfo?.goal || null,
        instructorClerkId: log.servedById,
        instructorName: userMap.get(log.servedById) || "Unknown Instructor",
        branchName: branchMap.get(log.branchId) || "Branch",
        handlingDurationMins: log.handlingDurationMins,
        waitDurationMins: log.waitDurationMins,
        completedAt: log.completedAt,
      };
    });

    res.status(200).json({
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalNewStudents: registeredLearnersList.length,
        paidNewStudents: registeredLearnersList.filter((s) => s.isPaid).length,
        unpaidNewStudents: registeredLearnersList.filter((s) => !s.isPaid)
          .length,
        totalLessonsCompleted: completedLessonsList.length,
      },
      registeredLearners: registeredLearnersList,
      completedLessons: completedLessonsList,
    });
  } catch (error: any) {
    console.error("Weekly analytics report error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ CROSS-BRANCH SPEED COMPARISON (GET /api/analytics/cross-branch)
export const getCrossBranchAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (typeof startDate === "string" && typeof endDate === "string") {
      filter.completedAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const aggregation = await CompletionLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$branchId",
          avgWaitTime: { $avg: "$waitDurationMins" },
          totalServiced: { $sum: 1 },
        },
      },
      { $sort: { avgWaitTime: 1 } },
    ]);

    const formatted = aggregation.map((item) => ({
      branchId: item._id,
      avgWaitTime: Math.round(item.avgWaitTime || 0),
      totalServiced: item.totalServiced,
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error("Cross-branch analytics error:", error);
    res.status(500).json({ error: error.message });
  }
};
