export interface MasterProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface QueueItem {
  id: string;
  profile: MasterProfile;
  position: number;
  status: "Active" | "Up Next" | "Waiting";
  estWait?: string;
  timestampAdded: number;
}

export interface CompletionLog {
  id: string;
  addedAt: number;
  completedAt: number;
}
