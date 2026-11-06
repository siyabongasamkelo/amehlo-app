import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    // Falls back to a local instance if your .env file isn't populated yet
    const connUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/amehlo_prototype";

    console.log("Mongo URI", connUri);
    const conn = await mongoose.connect(connUri);
    console.log(`🍃 MongoDB Cluster Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Database connection failure error: ${error.message}`);
    process.exit(1);
  }
};
