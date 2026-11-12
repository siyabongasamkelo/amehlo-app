import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { userService } from "../features/user/userService";
import type { IUserData } from "../features/user/userService";

interface AppContextType {
  dbUser: IUserData | null;
  setDbUser: React.Dispatch<React.SetStateAction<IUserData | null>>;
  isLoadingProfile: boolean;
  syncAndHydrateProfile: (inviteCode?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<IUserData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const isHydratingRef = useRef<boolean>(false);
  const lastSyncedClerkIdRef = useRef<string | null>(null);

  // 1. Passive fetch on app load — NEVER guesses role if user isn't in MongoDB yet!
  const hydrateExistingProfile = async () => {
    if (!clerkUser?.id || isHydratingRef.current) return;

    isHydratingRef.current = true;
    setIsLoadingProfile(true);
    try {
      const userProfile = await userService.getUserProfile(clerkUser.id);
      setDbUser(userProfile);
      lastSyncedClerkIdRef.current = clerkUser.id;
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDbUser(null);
      } else {
        console.error("Failed hydrating existing profile:", err);
      }
    } finally {
      setIsLoadingProfile(false);
      isHydratingRef.current = false;
    }
  };

  // 2. Explicit Staff/Owner sync (Called ONLY by staff/owner RegisterGateway)
  const syncAndHydrateProfile = async (inviteCode?: string) => {
    if (!clerkUser?.id || isHydratingRef.current) return;

    isHydratingRef.current = true;
    setIsLoadingProfile(true);
    try {
      const userProfile = await userService.syncClerkUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "Anonymous Node",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        role: inviteCode?.trim() ? "worker" : "owner",
        inviteCode: inviteCode?.trim() || undefined,
      });
      setDbUser(userProfile);
      lastSyncedClerkIdRef.current = clerkUser.id;
    } catch (err) {
      console.error("Staff/Owner sync failure:", err);
    } finally {
      setIsLoadingProfile(false);
      isHydratingRef.current = false;
    }
  };

  useEffect(() => {
    const clerkIdString = clerkUser?.id;

    if (isClerkLoaded && clerkIdString) {
      if (lastSyncedClerkIdRef.current === clerkIdString) return;
      hydrateExistingProfile();
    } else if (isClerkLoaded && !clerkIdString) {
      setDbUser(null);
      lastSyncedClerkIdRef.current = null;
      setIsLoadingProfile(false);
    }
  }, [clerkUser?.id, isClerkLoaded]);

  return (
    <AppContext.Provider
      value={{
        dbUser,
        setDbUser,
        isLoadingProfile,
        syncAndHydrateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
