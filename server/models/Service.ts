import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
  businessId: string; // Ties the service to the account owner
  name: string; // e.g., "Haircut", "Acrylic Nails"
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>({
  businessId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure a single business doesn't accidentally save duplicate service names
ServiceSchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Service = model<IService>("Service", ServiceSchema);
