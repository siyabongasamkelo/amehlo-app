import React, { useState } from "react";
import { CheckInForm } from "./components/CheckInForm";
import { LiveTicketHUD } from "./components/LiveTicketHUD";

interface ClientProfile {
  name: string;
  phone: string;
  email?: string;
}

export const CustomerGateway: React.FC = () => {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  const businessName = "Sizwe's Barber Shop";
  const branchName = "Empangeni Main St";
  const activeWaitCount = 4;
  const estWaitMinutes = 15;

  const handleJoinQueueSequence = (
    name: string,
    phone: string,
    email?: string,
  ) => {
    setProfile({ name, phone, email });
    setIsJoined(true);
  };

  const handleLeaveQueueSequence = () => {
    setIsJoined(false);
    setProfile(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      {!isJoined || !profile ? (
        <CheckInForm
          businessName={businessName}
          branchName={branchName}
          activeWaitCount={activeWaitCount}
          estWaitMinutes={estWaitMinutes}
          onJoin={handleJoinQueueSequence}
        />
      ) : (
        <LiveTicketHUD
          customerName={profile.name}
          customerPhone={profile.phone}
          customerEmail={profile.email}
          ticketNumber="065"
          currentPosition={5}
          peopleAhead={4}
          estWaitRange="15 - 20 mins"
          onLeave={handleLeaveQueueSequence}
        />
      )}
    </div>
  );
};
