import axios from "axios";
import type { IQueueItem } from "../../queue/services/queueService";

// const API_URL = "http://localhost:5000/api/queue";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/queue"
    : "https://amehlo-app.onrender.com/api/queue";

export const customerService = {
  // ➔ Let a guest customer join the branch line directly via their mobile browser
  joinQueueFromMobile: async (
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
};
