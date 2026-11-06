import axios from "axios";

// const API_URL = "http://localhost:5000/api/companies";

const API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api/companies"
    : "https://amehlo-app.onrender.com/api/companies";

export interface ICompanyData {
  _id: string;
  name: string;
  ownerId: string;
}

export const companyService = {
  // ➔ Create a corporate node profile
  createCompany: async (
    name: string,
    ownerId: string,
  ): Promise<ICompanyData> => {
    const response = await axios.post(API_URL, { name, ownerId });
    return response.data.company;
  },

  // ➔ Look up companies belonging to an owner
  getOwnerCompanies: async (ownerId: string): Promise<ICompanyData[]> => {
    const response = await axios.get(`${API_URL}/owner/${ownerId}`);
    return response.data.companies;
  },
};
