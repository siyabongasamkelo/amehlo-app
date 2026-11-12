import React, { createContext, useContext, useState, useEffect } from "react";
import { useApp } from "../../../context/AppContext";
import { useCompany } from "../../company/context/CompanyContext";
import { branchService } from "../services/branchService";
import type { IBranchData } from "../services/branchService";

interface BranchContextType {
  branches: IBranchData[];
  isLoadingBranches: boolean;
  activeBranchId: string | null;
  setActiveBranchId: (id: string | null) => void;
  loadCompanyBranches: (companyId: string) => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dbUser } = useApp();
  const { activeCompany } = useCompany();

  const [branches, setBranches] = useState<IBranchData[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const loadCompanyBranches = async (companyId: string) => {
    setIsLoadingBranches(true);
    try {
      const data = await branchService.getCompanyBranches(companyId);
      setBranches(data);
    } catch (err) {
      console.error("Failed fetching physical stations:", err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // 1. Worker sandbox branch hydration
  useEffect(() => {
    if (!dbUser) {
      setBranches([]);
      setActiveBranchId(null);
      return;
    }

    if (dbUser.role === "worker") {
      const fetchWorkerBranch = async () => {
        setIsLoadingBranches(true);
        try {
          const workerBranchId = dbUser.assignedBranchId || "br_1";
          const realBranchData =
            await branchService.getBranchById(workerBranchId);
          setBranches([realBranchData]);
          setActiveBranchId(realBranchData._id);
        } catch (branchErr) {
          console.error(
            "Failed to fetch worker sandbox branch details:",
            branchErr,
          );
          const fallbackBranch: IBranchData = {
            _id: dbUser.assignedBranchId || "br_1",
            name: "Resolving Station Name...",
            phone: "035 111 2222",
            companyId: dbUser.assignedCompanyId || "co_standard_cluster",
            inviteCode: "SANDBOX-ACTIVE",
          };
          setBranches([fallbackBranch]);
          setActiveBranchId(fallbackBranch._id);
        } finally {
          setIsLoadingBranches(false);
        }
      };

      fetchWorkerBranch();
    }
  }, [dbUser?._id, dbUser?.role]);

  // 2. Owner multi-branch hydration
  useEffect(() => {
    if (dbUser?.role === "owner") {
      if (activeCompany?._id) {
        loadCompanyBranches(activeCompany._id);
      } else {
        setBranches([]);
      }
    }
  }, [activeCompany?._id, dbUser?.role]);

  // 3. Auto-select first branch if none active
  useEffect(() => {
    if (branches.length > 0 && !activeBranchId) {
      setActiveBranchId(branches[0]._id);
    }
  }, [branches, activeBranchId]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        isLoadingBranches,
        activeBranchId,
        setActiveBranchId,
        loadCompanyBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};
