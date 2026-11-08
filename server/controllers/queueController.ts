import { Request, Response } from "express";
import { QueueTicket, CompletionLog } from "../models/QueueTicket.js";
import { resequenceBranchQueue } from "../utils/queueEngine.js";
import { io } from "../index.js"; // ➔ Import the active 'io' socket engine instance!

// ➔ JOIN QUEUE (POST /api/queue/join)
export const joinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, branchId, serviceId } = req.body; // ➔ Added serviceId
    if (!name || !phone || !branchId || !serviceId) {
      res.status(400).json({ error: "Missing required booking metrics." });
      return;
    }

    const currentCount = await QueueTicket.countDocuments({ branchId });
    const randomTicket = Math.floor(100 + Math.random() * 900).toString();

    const newTicket = new QueueTicket({
      ticketId: randomTicket,
      branchId,
      serviceId, // ➔ Bound ticket to service
      name,
      phone,
      email,
      position: currentCount + 1,
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
    console.log(error);
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
