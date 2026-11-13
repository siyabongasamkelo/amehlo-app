import { Request, Response } from "express";
import { QueueTicket, CompletionLog } from "../models/QueueTicket.js";
import { User } from "../models/User.js";
import { Enrollment } from "../models/Enrollment.js";
import { resequenceBranchQueue } from "../utils/queueEngine.js";
import { io } from "../index.js";
import { Branch } from "../models/Branch.js";
import { Service } from "../models/Service.js";

// ➔ JOIN QUEUE (POST /api/queue/join)
// 1. UPDATE JOIN QUEUE (Modify your existing joinQueue function)

// ➔ JOIN QUEUE PIPELINE (POST /api/queue/join)
export const joinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentClerkId, // ➔ Sent when a logged-in student joins via QR or Online
      name,
      phone,
      email,
      branchId,
      serviceId,
      isRemoteJoin,
      preferredWorkerId,
    } = req.body;

    if (!branchId || !serviceId) {
      res
        .status(400)
        .json({ error: "Missing required branch or service selection." });
      return;
    }

    let resolvedName = name?.trim();
    let resolvedPhone = phone?.trim();
    let resolvedEmail = email?.trim();

    // 🛡️ VERIFIED STUDENT GATEKEEPER & ENROLLMENT CHECK
    if (studentClerkId) {
      const student = await User.findOne({
        clerkId: studentClerkId,
        role: "student",
      });

      if (!student) {
        res.status(404).json({ error: "Student profile not found." });
        return;
      }

      // 1. Block duplicate active tickets for the same student
      const existingTicket = await QueueTicket.findOne({ studentClerkId });
      if (existingTicket) {
        res.status(400).json({
          error: "You already have an active ticket in the queue.",
          ticket: existingTicket,
        });
        return;
      }

      // 2. Verify active paid enrollment with remaining lessons
      const activeEnrollment = await Enrollment.findOne({
        studentClerkId,
        status: "active",
      });

      if (!activeEnrollment || !activeEnrollment.isPaid) {
        res.status(403).json({
          error:
            "Payment required: Please pay for your lesson bundle before joining the queue.",
        });
        return;
      }

      if (activeEnrollment.lessonsRemaining <= 0) {
        res.status(403).json({
          error:
            "0 lessons remaining: Please top up your course bundle to book another lesson.",
        });
        return;
      }

      // 3. Auto-fill verified details directly from the student's MongoDB profile
      resolvedName = student.name;
      resolvedPhone = student.phone || resolvedPhone || "No Phone";
      resolvedEmail = student.email || resolvedEmail;
    }

    if (!resolvedName || !resolvedPhone) {
      res.status(400).json({ error: "Missing student name or contact phone." });
      return;
    }

    const currentWaitingCount = await QueueTicket.countDocuments({
      branchId,
      status: "Waiting",
    });

    const randomTicketNum = Math.floor(100 + Math.random() * 900).toString();

    const newTicket = new QueueTicket({
      ticketId: randomTicketNum,
      branchId,
      serviceId,
      studentClerkId: studentClerkId || null,
      name: resolvedName,
      phone: resolvedPhone,
      email: resolvedEmail,
      position: currentWaitingCount + 1,
      presenceStatus: isRemoteJoin === false ? "Arrived" : "Remote",
      preferredWorkerId: preferredWorkerId?.trim() || null,
    });

    await newTicket.save();
    await resequenceBranchQueue(branchId);

    const updatedQueue = await QueueTicket.find({ branchId }).sort({
      position: 1,
    });

    io.to(branchId).emit("queue_updated", updatedQueue);

    res.status(201).json({
      message: "Joined operational queue pipeline successfully",
      ticket: newTicket,
      queue: updatedQueue,
    });
  } catch (error: any) {
    console.error("Join queue processing engine failure:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ START SERVICE / SAFETY PROMPT CONFIRMED (POST /api/queue/:id/start)
export const startService = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await QueueTicket.findById(id);

    if (!ticket) {
      res
        .status(404)
        .json({ error: "Active lane ticket reference not found." });
      return;
    }

    // Flip status track to Active and lock down the face-to-face counter timer stamp
    ticket.status = "Active";
    ticket.startedServiceAt = new Date();
    await ticket.save();

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Service lane activated successfully.",
      queue: freshQueue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ COMPLETE TURN, ARCHIVE LOG & DEDUCT 1 LESSON CREDIT (POST /api/queue/:id/complete)
export const completeTurn = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { servedById } = req.body;

    if (!servedById) {
      res.status(400).json({
        error:
          "Validation failed: Identity of the worker node is required to close turns.",
      });
      return;
    }

    const ticket = await QueueTicket.findById(id);
    if (!ticket) {
      res.status(404).json({ error: "Active lane ticket not found." });
      return;
    }

    const now = new Date();
    const addedTime = new Date(ticket.addedAt).getTime();
    const startTime = ticket.startedServiceAt
      ? new Date(ticket.startedServiceAt).getTime()
      : now.getTime();

    const waitDurationMins = Math.max(
      0,
      Math.round((startTime - addedTime) / 1000 / 60),
    );
    const handlingDurationMins = Math.max(
      1,
      Math.round((now.getTime() - startTime) / 1000 / 60),
    );

    await CompletionLog.create({
      ticketId: ticket.ticketId,
      branchId: ticket.branchId,
      serviceId: ticket.serviceId,
      studentClerkId: ticket.studentClerkId || null,
      servedById,
      waitDurationMins,
      handlingDurationMins,
      presenceStatus: ticket.presenceStatus,
      addedAt: ticket.addedAt,
      completedAt: now,
    });

    // 🎓 AUTOMATICALLY DEDUCT 1 LESSON CREDIT FROM STUDENT ENROLLMENT
    if (ticket.studentClerkId) {
      const enrollment = await Enrollment.findOne({
        studentClerkId: ticket.studentClerkId,
        status: "active",
      });

      if (enrollment && enrollment.lessonsRemaining > 0) {
        enrollment.lessonsRemaining -= 1;
        enrollment.lessonsSpent += 1;
        if (enrollment.lessonsRemaining === 0) {
          enrollment.status = "completed";
        }
        await enrollment.save();
      }
    }

    await QueueTicket.findByIdAndDelete(id);
    await resequenceBranchQueue(ticket.branchId);

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Turn completed, lesson credit deducted, and archived cleanly.",
      queue: freshQueue,
    });
  } catch (error: any) {
    console.error("Complete turn validation error breakdown:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➔ SHIFT TO BACK / SKIP (POST /api/queue/:id/skip)
export const skipTurn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await QueueTicket.findById(id);

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const totalTickets = await QueueTicket.countDocuments({
      branchId: ticket.branchId,
    });
    ticket.position = totalTickets + 1;
    ticket.addedAt = new Date();
    await ticket.save();

    await resequenceBranchQueue(ticket.branchId);

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });

    // ⚡ REAL-TIME BROADCAST: Tell all screens that a ticket has shifted to the back
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Shifted smoothly to backend track configuration",
      queue: freshQueue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FLAG ABSENT / GHOST FILTER PURGE (DELETE /api/queue/:id/ghost)
export const purgeGhostClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await QueueTicket.findById(id);

    if (!ticket) {
      res.status(404).json({ error: "Ticket target vanished or missing" });
      return;
    }

    await QueueTicket.findByIdAndDelete(id);
    await resequenceBranchQueue(ticket.branchId);

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });

    // ⚡ REAL-TIME BROADCAST: Eject absent client elements from all active displays
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Ghost container cleanly ejected",
      queue: freshQueue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH LIVE QUEUE FOR BRANCH WITH OPTIONAL SERVICE FILTERING (GET /api/queue/:branchId)
export const getBranchQueue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { branchId } = req.params;
    const { serviceId } = req.query; // ➔ Optional filter query string parameter: ?serviceId=XYZ

    const filterCondition: any = { branchId };
    if (serviceId) {
      filterCondition.serviceId = serviceId;
    }

    const activeQueue = await QueueTicket.find(filterCondition).sort({
      position: 1,
    });
    res.status(200).json({ queue: activeQueue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH QUEUE METRICS & ADVANCED ANALYTICS (GET /api/queue/:branchId/analytics)
export const getBranchQueueAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { branchId } = req.params;
    const logs = await CompletionLog.find({ branchId });

    if (logs.length === 0) {
      res.status(200).json({
        averageWaitTime: "0 mins",
        bestWaitTime: "0 mins",
        worstWaitTime: "0 mins",
        totalCompleted: 0,
        rawLogs: [],
      });
      return;
    }

    const durations = logs.map((log) => {
      const added =
        typeof log.addedAt === "number"
          ? log.addedAt
          : new Date(log.addedAt).getTime();
      const completed =
        typeof log.completedAt === "number"
          ? log.completedAt
          : new Date(log.completedAt).getTime();
      return (completed - added) / 1000 / 60; // in minutes
    });

    const totalDurationMins = durations.reduce((acc, curr) => acc + curr, 0);
    const avgMins = Math.round(totalDurationMins / logs.length);
    const bestMins = Math.round(Math.min(...durations));
    const worstMins = Math.round(Math.max(...durations));

    res.status(200).json({
      averageWaitTime: `${avgMins > 0 ? avgMins : 1} mins`,
      bestWaitTime: `${bestMins > 0 ? bestMins : 1} mins`,
      worstWaitTime: `${worstMins > 0 ? worstMins : 1} mins`,
      totalCompleted: logs.length,
      rawLogs: logs, // Send raw logs purely for localized peak hour tracking charts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCrossBranchComparison = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { startDate, endDate, serviceId } = req.query;

    // ➔ 1. Fallback defaults if frontend leaves dates blank (Defaults to last 7 days)
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date();
    if (!startDate) start.setDate(end.getDate() - 7);

    // ➔ 2. Build dynamic matching criteria
    const matchStage: any = {
      completedAt: { $gte: start, $lte: end },
    };

    // ➔ Bonus: Leverage your serviceId field if frontend wants to drill down
    if (serviceId) {
      matchStage.serviceId = serviceId;
    }

    // ➔ 3. Streamlined high-performance aggregation
    const branchComparisonData = await CompletionLog.aggregate([
      { $match: matchStage },
      {
        $project: {
          branchId: 1,
          waitDurationMins: {
            $divide: [
              { $subtract: ["$completedAt", "$addedAt"] },
              1000 * 60, // Milliseconds to minutes
            ],
          },
        },
      },
      {
        $group: {
          _id: "$branchId",
          avgWaitTime: { $avg: "$waitDurationMins" },
          bestWaitTime: { $min: "$waitDurationMins" },
          worstWaitTime: { $max: "$waitDurationMins" },
          totalCompleted: { $sum: 1 },
        },
      },
      { $sort: { avgWaitTime: 1 } },
    ]);

    const formattedData = branchComparisonData.map((item) => ({
      branchId: item._id,
      avgWaitTime: Math.round(item.avgWaitTime || 0),
      bestWaitTime: Math.round(item.bestWaitTime || 0),
      worstWaitTime: Math.round(item.worstWaitTime || 0),
      totalCompleted: item.totalCompleted,
    }));

    res.status(200).json(formattedData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyStoreArrival = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params; // ticket _id
    const ticket = await QueueTicket.findById(id);

    if (!ticket) {
      console.log("Ticket booking reference matching this identity not found.");
      res.status(404).json({
        error: "Ticket booking reference matching this identity not found.",
      });
      return;
    }

    // Flip status to physical presence
    ticket.presenceStatus = "Arrived";
    await ticket.save();

    // Resequence or refresh active states across terminals
    await resequenceBranchQueue(ticket.branchId);

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Welcome to the store! Presence validated successfully.",
      ticket,
      queue: freshQueue,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getStudentActiveTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const ticket = await QueueTicket.findOne({ studentClerkId: clerkId });
    res.status(200).json({ ticket: ticket || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ FETCH COMPLETED LESSON HISTORY FOR A STUDENT (GET /api/queue/student/:clerkId/history)
export const getStudentLessonHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { clerkId } = req.params;

    const logs = await CompletionLog.find({ studentClerkId: clerkId })
      .sort({ completedAt: -1 })
      .lean();

    if (logs.length === 0) {
      res.status(200).json({ history: [] });
      return;
    }

    // Collect unique IDs for batch lookups
    const workerClerkIds = [
      ...new Set(logs.map((l) => l.servedById).filter(Boolean)),
    ];
    const branchIds = [...new Set(logs.map((l) => l.branchId).filter(Boolean))];
    const serviceIds = [
      ...new Set(logs.map((l) => l.serviceId).filter(Boolean)),
    ];

    const [workers, branches, services] = await Promise.all([
      User.find({ clerkId: { $in: workerClerkIds } })
        .select("clerkId name")
        .lean(),
      Branch.find({ _id: { $in: branchIds } })
        .select("name")
        .lean(),
      Service.find({ _id: { $in: serviceIds } })
        .select("name")
        .lean(),
    ]);

    const workerMap = new Map(workers.map((w) => [w.clerkId, w.name]));
    const branchMap = new Map(branches.map((b) => [b._id.toString(), b.name]));
    const serviceMap = new Map(services.map((s) => [s._id.toString(), s.name]));

    const history = logs.map((log) => ({
      id: log._id.toString(),
      date: new Date(log.completedAt).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      instructorName: workerMap.get(log.servedById) || "Station Instructor",
      branchName: branchMap.get(log.branchId) || "Driving Yard",
      topic: serviceMap.get(log.serviceId) || "Driving Lesson",
    }));

    res.status(200).json({ history });
  } catch (error: any) {
    console.error("Fetch student lesson history failure:", error);
    res.status(500).json({ error: error.message });
  }
};
