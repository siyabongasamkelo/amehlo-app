import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/queue"
    : "https://amehlo-app.onrender.com/api/queue"; // ➔ Updated with your complete app sub-domain & routing path context!

export interface IQueueItem {
  _id: string;
  ticketId: string;
  branchId: string;
  serviceId: string; // ➔ Added to track multi-service lane assignments on the client
  name: string;
  phone: string;
  email?: string;
  position: number;
  status: "Active" | "Up Next" | "Waiting";
  presenceStatus?: "Remote" | "Arrived";
  addedAt: string;
}
export const queueService = {
  // ➔ Fetch active waiting tickets via (GET /api/queue/:branchId)
  getBranchQueue: async (branchId: string): Promise<IQueueItem[]> => {
    const response = await axios.get(`${API_URL}/${branchId}`);
    return response.data.queue;
  },

  // ➔ Create a brand new ticket bound to a specific category service via (POST /api/queue/join)
  insertTicket: async (
    branchId: string,
    name: string,
    phone: string,
    serviceId: string,
    isRemoteJoin: boolean = true,
    email?: string,
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${API_URL}/join`, {
      branchId,
      name,
      phone,
      serviceId,
      isRemoteJoin,
      email,
    });
    return response.data.ticket;
  },

  // ➔ Shift item to the back via (POST /api/queue/:id/skip)
  skipTurn: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.post(`${API_URL}/${ticketId}/skip`);
    return response.data.queue;
  },

  // ➔ Activate ticket counter processing path via (POST /api/queue/:id/start)
  startTurn: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.post(`${API_URL}/${ticketId}/start`);
    return response.data.queue;
  },

  // ➔ Forward worker clerkId to clear backend database validation tracks safely
  completeTurn: async (
    ticketId: string,
    servedById: string,
  ): Promise<IQueueItem[]> => {
    const response = await axios.post(`${API_URL}/${ticketId}/complete`, {
      servedById,
    });
    return response.data.queue;
  },

  // ➔ Discard absent ghost rows via (DELETE /api/queue/:id/ghost)
  purgeGhostClient: async (ticketId: string): Promise<IQueueItem[]> => {
    const response = await axios.delete(`${API_URL}/${ticketId}/ghost`);
    return response.data.queue;
  },

  // ➔ Fetch pre-calculated server analytics payload values
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

  // ➔ Fetch multi-branch comparison metrics filtered by an explicit date range
  getCrossBranchAnalytics: async (
    startDate: string,
    endDate: string,
  ): Promise<any[]> => {
    const response = await axios.get(
      `${API_URL.replace("/queue", "/analytics")}/cross-branch`,
      {
        params: { startDate, endDate },
      },
    );
    return response.data;
  },
};
