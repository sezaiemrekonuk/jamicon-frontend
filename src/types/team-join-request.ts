export interface TeamJoinRequest {
  id: string;
  teamId: string;
  userId: string;
  message?: string | null;
  createdAt: string;
    username: string | null;
    avatarUrl: string | null;
} 