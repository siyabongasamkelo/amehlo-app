import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
  businessId: string;
  name: string;
  price: number; // ➔ Standard price in ZAR (e.g., 4000 for Code 10)
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>({
  businessId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

ServiceSchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Service = model<IService>("Service", ServiceSchema);
