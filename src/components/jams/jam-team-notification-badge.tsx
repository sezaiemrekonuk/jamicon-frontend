"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { UserPlus, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JamTeamInvitation, JamTeamRequest } from "@/types/jam-team"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { jamTeamApi } from "@/lib/api/jam-team"

interface Props {
  className?: string
  fetchInvitations: () => Promise<JamTeamInvitation[]>
  fetchRequests: () => Promise<JamTeamRequest[]>
}

export function JamTeamNotificationBadge({
  className,
  fetchInvitations,
  fetchRequests,
}: Props) {
  const router = useRouter()
  const [invitations, setInvitations] = useState<JamTeamInvitation[]>([])
  const [requests, setRequests] = useState<JamTeamRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const totalCount = invitations.length + requests.length
  
  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const [invitationData, requestData] = await Promise.all([
        fetchInvitations(),
        fetchRequests()
      ])
      setInvitations(invitationData)
      setRequests(requestData)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    loadNotifications()
    
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const handleAcceptInvitation = async (invitation: JamTeamInvitation) => {
    try {
      await jamTeamApi.acceptJamTeamInvitation(invitation.id)
      await loadNotifications()
      toast.success(`Your team has joined ${invitation.jamName}`)
      router.refresh()
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast.error("Failed to accept invitation")
    }
  }
  
  const handleRejectInvitation = async (invitation: JamTeamInvitation) => {
    try {
      await jamTeamApi.rejectJamTeamInvitation(invitation.id)
      await loadNotifications()
      toast.success("Invitation declined")
    } catch (error) {
      console.error("Error rejecting invitation:", error)
      toast.error("Failed to reject invitation")
    }
  }
  
  const handleAcceptRequest = async (request: JamTeamRequest) => {
    try {
      await jamTeamApi.acceptJamTeamRequest(request.id)
      await loadNotifications()
      toast.success(`${request.teamName} has been added to your jam`)
      router.refresh()
    } catch (error) {
      console.error("Error accepting request:", error)
      toast.error("Failed to accept request")
    }
  }
  
  const handleRejectRequest = async (request: JamTeamRequest) => {
    try {
      await jamTeamApi.rejectJamTeamRequest(request.id)
      await loadNotifications()
      toast.success("Request declined")
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Failed to reject request")
    }
  }
  
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {totalCount === 0 
                ? "You have no notifications" 
                : `You have ${totalCount} ${totalCount === 1 ? 'notification' : 'notifications'}`}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {invitations.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-semibold">
              <div className="flex items-center">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                <span>Team Invitations</span>
              </div>
            </DropdownMenuLabel>
            
            {invitations.map((invitation) => (
              <DropdownMenuItem key={invitation.id} className="flex flex-col items-start py-2 cursor-default">
                <div className="w-full">
                  <div className="text-sm font-medium">{invitation.jamName}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Your team {invitation.teamName} has been invited to join this jam
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(invitation.createdAt)}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRejectInvitation(invitation)
                      }}
                    >
                      Decline
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAcceptInvitation(invitation)
                      }}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        
        {requests.length > 0 && (
          <>
            {invitations.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold">
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  <span>Team Requests</span>
                </div>
              </DropdownMenuLabel>
              
              {requests.map((request) => (
                <DropdownMenuItem key={request.id} className="flex flex-col items-start py-2 cursor-default">
                  <div className="w-full">
                    <div className="text-sm font-medium">{request.teamName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      This team wants to join your jam {request.jamName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(request.createdAt)}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRejectRequest(request)
                        }}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAcceptRequest(request)
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        
        {totalCount === 0 && (
          <div className="py-4 px-2 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p>You have no pending notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 