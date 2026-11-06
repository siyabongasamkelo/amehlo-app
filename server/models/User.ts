import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string; // The unique ID from Clerk (e.g., "user_2N6w...")
  name: string;
  email: string;
  role: "owner" | "worker";
  assignedBranchId?: string; // Workers are strictly sandboxed to this physical terminal
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: { type: String, enum: ["owner", "worker"], required: true },
  assignedBranchId: { type: String, default: null }, // Populated if role === "worker"
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", UserSchema);
