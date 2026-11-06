import { Schema, model, Document } from "mongoose";

// --- ACTIVE QUEUE TICKET INTERFACE ---
export interface IQueueTicket extends Document {
  ticketId: string; // 3-digit rolling ticket number (e.g., "412")
  branchId: string; // Tied to physical branch context
  name: string; // Customer name
  phone: string; // Customer contact line
  email?: string; // Optional client email
  position: number; // Sequential line position
  status: "Active" | "Up Next" | "Waiting";
  addedAt: Date;
}

// --- ARCHIVED COMPLETION LOG INTERFACE ---
export interface ICompletionLog extends Document {
  ticketId: string;
  branchId: string;
  addedAt: Date;
  completedAt: Date;
}

// --- ACTIVE TICKET SCHEMA ---
const QueueTicketSchema = new Schema<IQueueTicket>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  position: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Active", "Up Next", "Waiting"],
    default: "Waiting",
  },
  addedAt: { type: Date, default: Date.now },
});

// Compound index to guarantee uniqueness of ticket positions within a single physical branch
QueueTicketSchema.index({ branchId: 1, position: 1 });

// --- COMPLETION LOG SCHEMA ---
const CompletionLogSchema = new Schema<ICompletionLog>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true },
  addedAt: { type: Date, required: true },
  completedAt: { type: Date, default: Date.now },
});

export const QueueTicket = model<IQueueTicket>(
  "QueueTicket",
  QueueTicketSchema,
);
export const CompletionLog = model<ICompletionLog>(
  "CompletionLog",
  CompletionLogSchema,
);
