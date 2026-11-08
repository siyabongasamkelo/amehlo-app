import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/queue"
    : "https://onrender.com";

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
    serviceId: string, // ➔ Added serviceId parameter to match your updated backend requirements
    email?: string,
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${API_URL}/join`, {
      branchId,
      name,
      phone,
      serviceId, // ➔ Sent payload metrics directly to the API endpoint
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
