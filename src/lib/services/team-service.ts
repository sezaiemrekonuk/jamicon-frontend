import { 
  Team, 
  TeamWithMembers,
  CreateTeamRequest, 
  UpdateTeamRequest, 
  CreateInvitationRequest,
  TeamInvitation,
  UpdateRoleRequest
} from "@/types/team";
import { teamApi } from "../api/team";
import { apiClient } from "../api/client";
import { slugify } from "../utils";

// Re-export the team API functions with additional error handling
export async function fetchUserTeams(): Promise<Team[]> {
  try {
    return await teamApi.getUserTeams();
  } catch (error) {
    throw new Error(`Error fetching teams: ${error}`);
  }
}

export async function fetchTeamById(teamId: string): Promise<TeamWithMembers> {
  try {
    return await teamApi.getTeamById(teamId);
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("You must be a member of this team to view its details");
    }
    throw new Error(`Error fetching team: ${error.message || error}`);
  }
}

export async function fetchTeamBySlug(slug: string): Promise<TeamWithMembers> {
  try {
    return await teamApi.getTeamBySlug(slug);
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("You must be a member of this team to view its details");
    }
    throw new Error(`Error fetching team: ${error.message || error}`);
  }
}

export async function createTeam(teamData: CreateTeamRequest): Promise<Team> {
  try {
    // Auto-generate slug if not provided
    if (!teamData.slug && teamData.name) {
      teamData.slug = slugify(teamData.name);
    }
    
    return await teamApi.createTeam(teamData);
  } catch (error) {
    throw new Error(`Error creating team: ${error}`);
  }
}

export async function updateTeam(teamId: string, teamData: UpdateTeamRequest): Promise<Team> {
  try {
    // Auto-generate slug if name is provided but slug is not
    if (teamData.name && !teamData.slug) {
      teamData.slug = slugify(teamData.name);
    }
    
    return await teamApi.updateTeam(teamId, teamData);
  } catch (error) {
    throw new Error(`Error updating team: ${error}`);
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    await teamApi.deleteTeam(teamId);
  } catch (error) {
    throw new Error(`Error deleting team: ${error}`);
  }
}

// The following functions use the direct API endpoints until they are added to teamApi

export async function createInvitation(invitationData: CreateInvitationRequest): Promise<{invitationId: string, token: string}> {
  try {
    const response = await apiClient.post('/api/teams/invitations', invitationData);
    return response.data.data;
  } catch (error) {
    throw new Error(`Error creating invitation: ${error}`);
  }
}

export async function acceptInvitation(token: string): Promise<Team> {
  try {
    const response = await apiClient.post(`/api/teams/invitations/${encodeURIComponent(token)}/accept`);
    return response.data.data.team;
  } catch (error: any) {
    console.error('API error accepting invitation:', error.response?.data || error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Error accepting invitation: ${error}`);
  }
}

export async function rejectInvitation(token: string): Promise<void> {
  try {
    await apiClient.post(`/api/teams/invitations/${encodeURIComponent(token)}/reject`);
  } catch (error: any) {
    console.error('API error rejecting invitation:', error.response?.data || error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Error rejecting invitation: ${error}`);
  }
}

export async function getUserPendingInvitations(): Promise<TeamInvitation[]> {
  try {
    const response = await apiClient.get('/api/teams/invitations/pending');
    return response.data.data.invitations;
  } catch (error) {
    throw new Error(`Error fetching pending invitations: ${error}`);
  }
}

export async function getTeamPendingInvitations(teamId: string): Promise<{id: string, email: string, createdAt: Date, expiresAt: Date}[]> {
  try {
    const response = await apiClient.get(`/api/teams/${teamId}/invitations/pending`);
    return response.data.data.invitations;
  } catch (error) {
    throw new Error(`Error fetching team pending invitations: ${error}`);
  }
}

export async function cancelInvitation(teamId: string, invitationId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/teams/${teamId}/invitations/${invitationId}`);
  } catch (error) {
    throw new Error(`Error canceling invitation: ${error}`);
  }
}

export async function transferTeamOwnership(teamId: string, userId: string): Promise<Team> {
  try {
    const response = await apiClient.patch(`/api/teams/${teamId}/transfer-ownership`, { userId, teamRole: 'ADMIN' });
    return response.data.data.team;
  } catch (error) {
    throw new Error(`Error transferring ownership: ${error}`);
  }
}

export async function updateMemberRole(teamId: string, roleData: UpdateRoleRequest): Promise<Team> {
  try {
    const response = await apiClient.patch(`/api/teams/${teamId}/members/role`, roleData);
    return response.data.data.team;
  } catch (error) {
    throw new Error(`Error updating member role: ${error}`);
  }
}

export async function removeMember(teamId: string, memberId: string): Promise<Team> {
  try {    
    const response = await apiClient.delete(`/api/teams/${teamId}/members/${memberId}`);
    return response.data.data.team;
  } catch (error: any) {
    console.error('Error removing member:', error.response?.data || error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Error removing member: ${error}`);
  }
}

export async function resendInvitation(teamId: string, invitationId: string): Promise<void> {
  try {
    await apiClient.post(`/api/teams/${teamId}/invitations/${invitationId}/resend`);
  } catch (error) {
    throw new Error(`Error resending invitation: ${error}`);
  }
} 