export interface WaitlistListing {
  id: string;
  teamId: string;
  jamId?: string;
  createdAt: string;
  team: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    maxSize?: number | null;
  };
} 