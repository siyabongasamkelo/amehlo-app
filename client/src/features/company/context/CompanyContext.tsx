import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import { companyService } from "../services/companyService";
import type { ICompanyData } from "../services/companyService";

const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

interface CompanyContextType {
  activeCompany: ICompanyData | null;
  setActiveCompany: (company: ICompanyData | null) => void;
  isLoadingCompany: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dbUser, isLoadingProfile } = useApp();
  const [activeCompany, setActiveCompany] = useState<ICompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState<boolean>(false);

  useEffect(() => {
    // 1. Wait until AppContext finishes checking who is logged in!
    if (isLoadingProfile) {
      setIsLoadingCompany(true);
      return;
    }

    // 2. Only clear company when we are 100% sure nobody is logged in
    if (!dbUser) {
      setActiveCompany(null);
      setIsLoadingCompany(false);
      return;
    }

    const resolveCompany = async () => {
      setIsLoadingCompany(true);
      try {
        if (dbUser.role === "owner") {
          const companies = await companyService.getOwnerCompanies(dbUser._id);

          setActiveCompany(companies.length > 0 ? companies[0] : null);
        } else if (dbUser.assignedCompanyId) {
          const res = await axios.get(
            `${BASE_API_URL}/companies/${dbUser.assignedCompanyId}`,
          );
          setActiveCompany(res.data.company || res.data || null);
        } else {
          setActiveCompany(null);
        }
      } catch (err) {
        console.error("Failed resolving active company:", err);
        setActiveCompany(null);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    resolveCompany();
  }, [dbUser?._id, dbUser?.role, dbUser?.assignedCompanyId, isLoadingProfile]);

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        setActiveCompany,
        isLoadingCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
