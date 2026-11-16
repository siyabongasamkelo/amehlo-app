import { QueueTicket } from "../models/QueueTicket.js";

/**
 * Recalculates and bulk-updates positions and operational statuses
 * for all active tickets inside a given branch cluster.
 */
export const resequenceBranchQueue = async (
  branchId: string,
): Promise<void> => {
  const tickets = await QueueTicket.find({ branchId });

  // 1. Keep active lessons at the very top
  const activeTickets = tickets
    .filter((t) => t.status === "Active")
    .sort((a, b) => a.position - b.position);

  // 2. VIP tickets jump ahead of all standard waiting tickets
  const vipWaiting = tickets
    .filter((t) => t.status !== "Active" && t.isVip)
    .sort(
      (a, b) =>
        new Date(a.vipGrantedAt || a.addedAt).getTime() -
        new Date(b.vipGrantedAt || b.addedAt).getTime(),
    );

  // 3. Standard waiting tickets keep their normal order
  const regularWaiting = tickets
    .filter((t) => t.status !== "Active" && !t.isVip)
    .sort(
      (a, b) =>
        a.position - b.position ||
        new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
    );

  const ordered = [...activeTickets, ...vipWaiting, ...regularWaiting];

  const bulkOps = ordered.map((ticket, index) => {
    const newPosition = index + 1;
    let newStatus: "Active" | "Up Next" | "Waiting" = ticket.status;

    if (ticket.status !== "Active") {
      newStatus =
        newPosition === 1
          ? "Active"
          : newPosition === 2
            ? "Up Next"
            : "Waiting";
    }

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
