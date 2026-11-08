import { Schema, model, Document } from "mongoose";

// --- ACTIVE QUEUE TICKET INTERFACE ---
export interface IQueueTicket extends Document {
  ticketId: string;
  branchId: string;
  serviceId: string; // ➔ Added to tie ticket to a specific service category
  name: string;
  phone: string;
  email?: string;
  position: number;
  status: "Active" | "Up Next" | "Waiting";
  addedAt: Date;
}

// --- ARCHIVED COMPLETION LOG INTERFACE ---
export interface ICompletionLog extends Document {
  ticketId: string;
  branchId: string;
  serviceId: string; // ➔ Added for tracking analytics by category
  addedAt: Date;
  completedAt: Date;
}

// --- ACTIVE TICKET SCHEMA ---
const QueueTicketSchema = new Schema<IQueueTicket>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true },
  serviceId: { type: String, required: true }, // ➔ Enforced service assignment
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

QueueTicketSchema.index({ branchId: 1, position: 1 });

// --- COMPLETION LOG SCHEMA ---
const CompletionLogSchema = new Schema<ICompletionLog>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true },
  serviceId: { type: String, required: true }, // ➔ Logged for business intelligence
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
