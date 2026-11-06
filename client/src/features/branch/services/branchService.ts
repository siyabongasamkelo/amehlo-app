import axios from "axios";

const API_URL = "http://localhost:5000/api/branches";

export interface IBranchData {
  _id: string;
  name: string;
  phone: string;
  companyId: string;
  inviteCode: string;
}

export const branchService = {
  // ➔ Provision a real physical branch line
  createBranch: async (
    name: string,
    phone: string,
    companyId: string,
  ): Promise<IBranchData> => {
    const response = await axios.post(API_URL, { name, phone, companyId });
    return response.data.branch;
  },

  // ➔ Fetch active branches linked to the company
  getCompanyBranches: async (companyId: string): Promise<IBranchData[]> => {
    const response = await axios.get(`${API_URL}/company/${companyId}`);
    return response.data.branches;
  },
};
