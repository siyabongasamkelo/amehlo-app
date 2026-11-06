import { QueueTicket } from "../models/QueueTicket.js";

/**
 * Recalculates and bulk-updates positions and operational statuses
 * for all active tickets inside a given branch cluster.
 */
export const resequenceBranchQueue = async (
  branchId: string,
): Promise<void> => {
  // Pull all active tickets for the branch ordered by current positions/timestamps
  const tickets = await QueueTicket.find({ branchId }).sort({
    position: 1,
    addedAt: 1,
  });

  const bulkOps = tickets.map((ticket, index) => {
    const newPosition = index + 1;
    let newStatus: "Active" | "Up Next" | "Waiting" = "Waiting";

    if (newPosition === 1) newStatus = "Active";
    else if (newPosition === 2) newStatus = "Up Next";

    return {
      updateOne: {
        filter: { _id: ticket._id },
        update: { $set: { position: newPosition, status: newStatus } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await QueueTicket.bulkWrite(bulkOps);
  }
};
