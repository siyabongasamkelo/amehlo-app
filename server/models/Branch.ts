import { Schema, model, Document } from "mongoose";

export interface IBranch extends Document {
  name: string;
  phone: string;
  companyId: string; // 🏢 Links directly back to its Corporate Parent Node
  inviteCode: string; // 🔒 The secure, unique Staff Token (e.g., "AMHL-EMP-92")
  createdAt: Date;
  businessId: string;
}

const BranchSchema = new Schema<IBranch>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  companyId: { type: String, required: true, index: true },
  inviteCode: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Branch = model<IBranch>("Branch", BranchSchema);
