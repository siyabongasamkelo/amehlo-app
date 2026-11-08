import axios from "axios";
import type { IQueueItem } from "../../queue/services/queueService";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/queue"
    : "https://onrender.com";

export const customerService = {
  // ➔ Let a guest customer join the branch line directly via their mobile browser with a service lane bind
  joinQueueFromMobile: async (
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
      serviceId, // ➔ Sent payload metrics directly downstream to the API
      email,
    });
    return response.data.ticket;
  },

  leaveQueueFromMobile: async (ticketId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${ticketId}/ghost`);
  },
};
