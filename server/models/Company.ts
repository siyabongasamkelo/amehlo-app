import { Schema, model, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  ownerId: string; // Ties back to the User's clerkId
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true, trim: true },
  ownerId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Company = model<ICompany>("Company", CompanySchema);
