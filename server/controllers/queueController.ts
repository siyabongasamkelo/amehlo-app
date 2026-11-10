import { Request, Response } from "express";
import { QueueTicket, CompletionLog } from "../models/QueueTicket.js";
import { resequenceBranchQueue } from "../utils/queueEngine.js";
import { io } from "../index.js"; // ➔ Import the active 'io' socket engine instance!

// ➔ JOIN QUEUE (POST /api/queue/join)
// 1. UPDATE JOIN QUEUE (Modify your existing joinQueue function)
export const joinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    // ➔ Add presenceStatus check from request body (Defaults to "Remote" if not sent)
    const { name, phone, email, branchId, serviceId, isRemoteJoin } = req.body;
    if (!name || !phone || !branchId || !serviceId) {
      res.status(400).json({ error: "Missing required booking metrics." });
      return;
    }

    const currentCount = await QueueTicket.countDocuments({ branchId });
    const randomTicket = Math.floor(100 + Math.random() * 900).toString();

    const newTicket = new QueueTicket({
      ticketId: randomTicket,
      branchId,
      serviceId,
      name,
      phone,
      email,
      position: currentCount + 1,
      // 🎯 If joined from app dashboard/home, flag as Remote. If scanned inside, it can be Arrived.
      presenceStatus: isRemoteJoin === false ? "Arrived" : "Remote",
    });

    await newTicket.save();
    await resequenceBranchQueue(branchId);

    const updatedQueue = await QueueTicket.find({ branchId }).sort({
      position: 1,
    });
    io.to(branchId).emit("queue_updated", updatedQueue);

    res.status(201).json({
      message: "Joined pipeline successfully",
      ticket: newTicket,
      queue: updatedQueue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ➔ COMPLETE TURN (POST /api/queue/:id/complete)
export const completeTurn = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await QueueTicket.findById(id);

    if (!ticket) {
      res.status(404).json({ error: "Active lane ticket not found" });
      return;
    }

    await CompletionLog.create({
      ticketId: ticket.ticketId,
      branchId: ticket.branchId,
      serviceId: ticket.serviceId, // ➔ Transferred to metrics history engine
      addedAt: ticket.addedAt,
    });

    await QueueTicket.findByIdAndDelete(id);
    await resequenceBranchQueue(ticket.branchId);

    const freshQueue = await QueueTicket.find({
      branchId: ticket.branchId,
    }).sort({ position: 1 });
    io.to(ticket.branchId).emit("queue_updated", freshQueue);

    res.status(200).json({
      message: "Turn completed and archived cleanly",
      queue: freshQueue,
    });
  } catch (error: any) {
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
    res.status(500).json({ error: error.message });
  }
};
