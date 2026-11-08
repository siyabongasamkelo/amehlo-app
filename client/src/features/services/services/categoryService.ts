import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/services"
    : "https://amehlo-app.onrender.com/api/services";

export interface IServiceData {
  _id: string;
  businessId: string;
  name: string;
  createdAt: string;
}

export const categoryService = {
  // ➔ Mass seed categories during initial branch onboarding configurations
  setupServices: async (
    businessId: string,
    services: string[],
  ): Promise<void> => {
    await axios.post(`${API_URL}/setup`, { businessId, services });
  },

  // ➔ Fetch active functional services configured for a specific workplace node
  getBusinessServices: async (businessId: string): Promise<IServiceData[]> => {
    const response = await axios.get(`${API_URL}/${businessId}`);
    return response.data.services;
  },
};
