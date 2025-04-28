"use client"

import * as React from "react"
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Users, 
  UserPlus, 
  MailPlus, 
  Mail
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  getUserPendingInvitations, 
  acceptInvitation, 
  rejectInvitation 
} from "@/lib/services/team-service"
import { TeamInvitation } from "@/types/team"

interface NotificationDropdownProps {
  className?: string
}

// Custom hook to handle notification logic
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<TeamInvitation[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [actionInProgress, setActionInProgress] = React.useState<{[key: string]: boolean}>({})

  const fetchInvitations = async () => {
    setIsLoading(true)
    try {
      const invitations = await getUserPendingInvitations()
      setNotifications(invitations)
    } catch (error) {
      console.error('Error fetching team invitations:', error)
      toast.error('Failed to load team invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    
    try {
      await acceptInvitation(invitation.token)
      
      // Remove the invitation from the list
      setNotifications(notifications.filter(inv => inv.id !== invitation.id))
      
      toast.success(`You have joined ${invitation.teamName}`)
      
      // Optionally redirect to the team page
      // router.push(`/teams/${invitation.teamSlug}`);
    } catch (err) {
      toast.error('Failed to accept team invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  const handleRejectInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    
    try {
      await rejectInvitation(invitation.token)
      
      // Remove the invitation from the list
      setNotifications(notifications.filter(inv => inv.id !== invitation.id))
      
      toast.success("You have declined the team invitation")
    } catch (err) {
      toast.error('Failed to reject team invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  // Initialize notifications on mount
  React.useEffect(() => {
    fetchInvitations()
  }, [])

  return {
    notifications,
    isLoading,
    actionInProgress,
    fetchInvitations,
    handleAcceptInvitation,
    handleRejectInvitation
  }
}

// Dropdown component for notifications
export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    notifications,
    isLoading,
    actionInProgress,
    fetchInvitations,
    handleAcceptInvitation,
    handleRejectInvitation
  } = useNotifications()
  
  const renderNotificationContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (notifications.length === 0) {
      return (
        <div className="px-2 py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <Mail className="h-12 w-12 text-muted-foreground/50" />
          <span>No pending invitations</span>
        </div>
      )
    }

    return (
      <>
        {notifications.map((invitation) => (
          <DropdownMenuItem key={invitation.id} className="cursor-default flex flex-col items-start py-3">
            <div className="font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span>You've been invited to join {invitation.teamName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Sent: {formatDate(invitation.createdAt.toString())}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Expires: {formatDate(invitation.expiresAt.toString())}</span>
              </div>
            </div>
            <div className="flex w-full justify-end gap-2 mt-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRejectInvitation(invitation)
                }}
                disabled={actionInProgress[invitation.id]}
              >
                {actionInProgress[invitation.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Decline
              </Button>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAcceptInvitation(invitation)
                }}
                disabled={actionInProgress[invitation.id]}
              >
                {actionInProgress[invitation.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accept
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MailPlus className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm font-semibold">Team Invitations</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fetchInvitations()
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderNotificationContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Component for mobile drawer notifications
export function MobileNotifications() {
  const {
    notifications,
    isLoading,
    actionInProgress,
    fetchInvitations,
    handleAcceptInvitation,
    handleRejectInvitation
  } = useNotifications()
  
  if (notifications.length === 0 && !isLoading) return null
  
  return (
    <div className="py-3 border-t border-b">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Team Invitations</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs"
          onClick={fetchInvitations}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <span>No pending invitations</span>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((invitation) => (
            <div key={invitation.id} className="bg-accent/50 rounded-md p-3">
              <div className="text-sm font-medium mb-1">
                <div className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-primary" />
                  <span>You've been invited to join {invitation.teamName}</span>
                </div>
              </div>
              <div className="flex flex-col text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Sent: {formatDate(invitation.createdAt.toString())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Expires: {formatDate(invitation.expiresAt.toString())}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleRejectInvitation(invitation)}
                  disabled={actionInProgress[invitation.id]}
                >
                  {actionInProgress[invitation.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAcceptInvitation(invitation)}
                  disabled={actionInProgress[invitation.id]}
                >
                  {actionInProgress[invitation.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 