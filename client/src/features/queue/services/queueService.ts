import axios from "axios";

// 🎯 CRITICAL FIX: Base matches your singular backend express routing definitions
// const API_URL = "http://localhost:5000/api/queue";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/queue"
    : "https://amehlo-app.onrender.com/api/queue";

export interface IQueueItem {
  _id: string; // The MongoDB Document identity key
  ticketId: string; // The 3-digit randomized ticket number string
  branchId: string;
  name: string;
  phone: string;
  email?: string;
  position: number;
  status: "Active" | "Up Next" | "Waiting";
  addedAt: string;
}

export const queueService = {
  // ➔ Fetch active waiting tickets via (GET /api/queue/:branchId)
  getBranchQueue: async (branchId: string): Promise<IQueueItem[]> => {
    const response = await axios.get(`${API_URL}/${branchId}`);
    return response.data.queue;
  },

  // ➔ Create a brand new ticket via (POST /api/queue/join)
  insertTicket: async (
    branchId: string,
    name: string,
    phone: string,
    email?: string,
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${API_URL}/join`, {
      branchId,
      name,
      phone,
      email,
    });
    return response.data.ticket;
  },

  // ➔ Shift item to the back via (POST /api/queue/:id/skip)
  skipTurn: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.post(`${API_URL}/${ticketId}/skip`);
    return response.data.queue;
  },

  // ➔ Log historical metrics data points via (POST /api/queue/:id/complete)
  completeTurn: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.post(`${API_URL}/${ticketId}/complete`);
    return response.data.queue;
  },

  // ➔ Discard absent ghost rows via (DELETE /api/queue/:id/ghost)
  purgeGhostClient: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.delete(`${API_URL}/${ticketId}/ghost`);
    return response.data.queue;
  },

  // ➔ Fetch pre-calculated server analytics payload values
  // 🎯 UPDATE THIS SPECIFIC METHOD CAPTURE SIGNATURE INSIDE YOUR frontend queueService.ts
  getBranchAnalytics: async (
    branchId: string,
  ): Promise<{
    averageWaitTime: string;
    bestWaitTime: string;
    worstWaitTime: string;
    totalCompleted: number;
    rawLogs: any[];
  }> => {
    const response = await axios.get(`${API_URL}/${branchId}/analytics`);
    return response.data;
  },
};
