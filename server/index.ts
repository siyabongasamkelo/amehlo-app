import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import queueRoutes from "./routes/queueRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://amehlo-queue.netlify.app", // 🎯 Added full protocol prefix safely
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/queue", queueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/branches", branchRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "online" });
});

// 🔒 THE SOCKET CORE: Wrap express into an HTTP server instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", // Local development
      "http://127.0.0.1:5173", // Backup local fallback loop
      "https://amehlo-queue.netlify.app", // Clean live Netlify origin with https://
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Persistent socket line activated cleanly: ${socket.id}`);

  socket.on("join_branch_room", (branchId: string) => {
    socket.join(branchId);
    console.log(`Socket node connected to branch room pipeline: ${branchId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket line closed: ${socket.id}`);
  });
});

export { io };

// 🎯 CRITICAL SCALE FIX: Listen to the wrapped httpServer framework pipeline instead of raw app!
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Amehlo Monolith Engine ignited cleanly at http://localhost:${PORT}`,
  );
});
