import { Schema, model, Document } from "mongoose";

export interface IEnrollment extends Document {
  studentClerkId: string; // Links directly to User.clerkId
  goal: "learners" | "drivers";
  code: string; // e.g., "Code 8", "Code 10", "Code 14", "Code 2 (Learners)"
  isPaid: boolean;
  totalLessons: number;
  lessonsSpent: number;
  lessonsRemaining: number;
  status: "active" | "completed";
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentClerkId: { type: String, required: true, index: true },
  goal: { type: String, enum: ["learners", "drivers"], required: true },
  code: { type: String, required: true, trim: true },
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
