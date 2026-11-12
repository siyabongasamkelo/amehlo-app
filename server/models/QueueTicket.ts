import { Schema, model, Document } from "mongoose";

// --- ACTIVE QUEUE TICKET INTERFACE ---
export interface IQueueTicket extends Document {
  ticketId: string;
  branchId: string;
  serviceId: string;
  studentClerkId?: string; // ➔ Links ticket directly to the logged-in student
  name: string;
  phone: string;
  email?: string;
  position: number;
  status: "Waiting" | "Active" | "Up Next";
  presenceStatus: "Remote" | "Arrived";
  preferredWorkerId?: string;
  addedAt: Date;
  startedServiceAt?: Date;
}

// --- ARCHIVED COMPLETION LOG INTERFACE ---
export interface ICompletionLog extends Document {
  ticketId: string;
  branchId: string;
  serviceId: string;
  studentClerkId?: string; // ➔ Tracks completed lessons per student
  servedById: string;
  waitDurationMins: number;
  handlingDurationMins: number;
  presenceStatus: "Remote" | "Arrived";
  feedbackRating?: number;
  addedAt: Date;
  completedAt: Date;
}

// --- ACTIVE TICKET SCHEMA ---
const QueueTicketSchema = new Schema<IQueueTicket>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  studentClerkId: { type: String, default: null, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  position: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Waiting", "Active", "Up Next"],
    default: "Waiting",
  },
  presenceStatus: {
    type: String,
    enum: ["Remote", "Arrived"],
    default: "Remote",
  },
  preferredWorkerId: { type: String, default: null, index: true },
  addedAt: { type: Date, default: Date.now },
  startedServiceAt: { type: Date, default: null },
});

QueueTicketSchema.index({ branchId: 1, position: 1 });

// --- COMPLETION LOG SCHEMA ---
const CompletionLogSchema = new Schema<ICompletionLog>({
  ticketId: { type: String, required: true },
  branchId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true },
  studentClerkId: { type: String, default: null, index: true },
  servedById: { type: String, required: true, index: true },
  waitDurationMins: { type: Number, required: true },
  handlingDurationMins: { type: Number, required: true },
  presenceStatus: { type: String, enum: ["Remote", "Arrived"], required: true },
  feedbackRating: { type: Number, default: null },
  addedAt: { type: Date, required: true },
  completedAt: { type: Date, default: Date.now, index: true },
});

export const QueueTicket = model<IQueueTicket>(
  "QueueTicket",
  QueueTicketSchema,
);
export const CompletionLog = model<ICompletionLog>(
  "CompletionLog",
  CompletionLogSchema,
);
