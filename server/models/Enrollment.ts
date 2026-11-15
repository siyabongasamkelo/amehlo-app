import { Schema, model, Document } from "mongoose";

export interface IEnrollment extends Document {
  studentClerkId: string;
  serviceId?: string | null; // ➔ Links back to the chosen Service
  goal: "learners" | "drivers";
  code: string;
  supposedPrice: number; // ➔ Total agreed price for this course/bundle
  amountPaid: number; // ➔ Cumulative Rand amount paid so far
  isPaid: boolean; // ➔ Automatically true once amountPaid >= supposedPrice (or verified)
  totalLessons: number;
  lessonsSpent: number;
  lessonsRemaining: number;
  status: "active" | "completed";
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentClerkId: { type: String, required: true, index: true },
  serviceId: { type: String, default: null, index: true },
  goal: { type: String, enum: ["learners", "drivers"], required: true },
  code: { type: String, required: true, trim: true },
  supposedPrice: { type: Number, default: 0, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  isPaid: { type: Boolean, default: false },
  totalLessons: { type: Number, required: true, min: 1 },
  lessonsSpent: { type: Number, default: 0, min: 0 },
  lessonsRemaining: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);
