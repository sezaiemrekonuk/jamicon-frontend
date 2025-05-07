"use client"

import { useState, useEffect } from "react"
import { jamTeamApi } from "@/lib/api/jam-team"
import { JamTeamInvitation, JamTeamRequest } from "@/types/jam-team"
import { JamTeamNotificationItem } from "./jam-team-notification-item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"

interface JamTeamNotificationsProps {
  teamId?: string
  jamId?: string
  className?: string
  onTeamAccepted?: (teamId: string, teamName: string, teamSlug: string) => void
}

export function JamTeamNotifications({
  teamId,
  jamId,
  className,
  onTeamAccepted
}: JamTeamNotificationsProps) {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<JamTeamInvitation[]>([])
  const [requests, setRequests] = useState<JamTeamRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      // Fetch based on which parameter is provided
      if (teamId) {
        try {
          const [teamInvitations, teamRequests] = await Promise.all([
            jamTeamApi.getTeamPendingInvitations(teamId),
            jamTeamApi.getTeamPendingRequests(teamId)
          ])
          setInvitations(teamInvitations)
          setRequests(teamRequests)
        } catch (error: any) {
          // Silently handle 403 errors (user likely doesn't have permission)
          if (error.response?.status !== 403) {
            console.error("Error fetching team notifications:", error)
          }
          setInvitations([])
          setRequests([])
        }
      } else if (jamId) {
        try {
          const [jamInvitations, jamRequests] = await Promise.all([
            jamTeamApi.getJamPendingInvitations(jamId),
            jamTeamApi.getJamPendingRequests(jamId)
          ])

          setInvitations(jamInvitations)
          setRequests(jamRequests)
        } catch (error: any) {
          // Silently handle 403 errors (user likely doesn't have permission)
          if (error.response?.status !== 403) {
            console.error("Error fetching jam notifications:", error)
          }
          setInvitations([])
          setRequests([])
        }
      }
    } catch (err) {
      // This catch block handles any other errors that might occur
      console.error("Error in fetchNotifications:", err)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    if (user && (teamId || jamId)) {
      fetchNotifications()
    }
  }, [user, teamId, jamId])

  const handleActionComplete = (notificationType: "invitation" | "request", data: JamTeamInvitation | JamTeamRequest) => {
    fetchNotifications()
    
    // If accepting a team and the callback is provided, call it with team info
    if (onTeamAccepted && notificationType === "request") {
      onTeamAccepted(data.teamId, data.teamName, data.teamSlug)
    } else if (onTeamAccepted && notificationType === "invitation") {
      onTeamAccepted(data.teamId, data.teamName, data.teamSlug)
    }
  }
  
  const hasNotifications = invitations.length > 0 || requests.length > 0
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (!hasNotifications) {
    return null
  }
  
  return (
    <div className={className}>
      <Tabs defaultValue={invitations.length > 0 ? "invitations" : "requests"}>
        <TabsList className="mb-4">
          <TabsTrigger value="invitations" disabled={invitations.length === 0}>
            Invitations 
            {invitations.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 inline-flex items-center justify-center text-xs">
                {invitations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" disabled={requests.length === 0}>
            Requests
            {requests.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 inline-flex items-center justify-center text-xs">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invitations">
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <JamTeamNotificationItem
                key={invitation.id}
                type="invitation"
                data={invitation}
                onActionComplete={() => handleActionComplete("invitation", invitation)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="requests">
          <div className="space-y-4">
            {requests.map((request) => (
              <JamTeamNotificationItem
                key={request.id}
                type="request"
                data={request}
                onActionComplete={() => handleActionComplete("request", request)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 