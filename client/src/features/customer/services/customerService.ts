import axios from "axios";
import type { IQueueItem } from "../../queue/services/queueService";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/queue"
    : "https://amehlo-app.onrender.com/api/queue";

export const customerService = {
  // Let a guest customer join the branch line directly via their mobile browser with a service lane bind
  joinQueueFromMobile: async (
    branchId: string,
    name: string,
    phone: string,
    serviceId: string,
    email?: string,
    isRemoteJoin: boolean = true,
  ): Promise<IQueueItem> => {
    const response = await axios.post(`${API_URL}/join`, {
      branchId,
      name,
      phone,
      serviceId,
      email,
      isRemoteJoin,
    });
    return response.data.ticket;
  },

  confirmPhysicalArrival: async (ticketId: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/${ticketId}/arrive`);
    return response.data;
  },

  leaveQueueFromMobile: async (ticketId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${ticketId}/ghost`);
  },
};
