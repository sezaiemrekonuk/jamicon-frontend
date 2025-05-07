"use client"

import * as React from "react"
import { useState } from "react"
import { Loader2, UserPlus, Users, Check, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { jamTeamApi } from "@/lib/api/jam-team"
import { JamTeamInvitation, JamTeamRequest } from "@/types/jam-team"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface JamTeamNotificationItemProps {
  type: "invitation" | "request"
  data: JamTeamInvitation | JamTeamRequest
  onActionComplete?: () => void
  className?: string
}

export function JamTeamNotificationItem({
  type,
  data,
  onActionComplete,
  className
}: JamTeamNotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAccept = async () => {
    setIsLoading(true)
    try {
      if (type === "invitation") {
        await jamTeamApi.acceptJamTeamInvitation(data.id)
        toast.success(`Your team has joined ${data.jamName}`)
      } else {
        await jamTeamApi.acceptJamTeamRequest(data.id)
        toast.success(`Team ${data.teamName} has been added to ${data.jamName}`)
      }
      
      if (onActionComplete) {
        onActionComplete()
      }
    } catch (err) {
      console.error("Error accepting:", err)
      toast.error(type === "invitation" 
        ? "Failed to accept jam invitation" 
        : "Failed to accept team request")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleReject = async () => {
    setIsLoading(true)
    try {
      if (type === "invitation") {
        await jamTeamApi.rejectJamTeamInvitation(data.id)
        toast.success(`Invitation to join ${data.jamName} declined`)
      } else {
        await jamTeamApi.rejectJamTeamRequest(data.id)
        toast.success(`Request from ${data.teamName} declined`)
      }
      
      if (onActionComplete) {
        onActionComplete()
      }
    } catch (err) {
      console.error("Error rejecting:", err)
      toast.error(type === "invitation" 
        ? "Failed to reject jam invitation" 
        : "Failed to reject team request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("p-4 border rounded-lg bg-card", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            {type === "invitation" ? (
              <UserPlus className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <Users className="h-5 w-5 text-primary mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-medium leading-none">
                {type === "invitation" 
                  ? `Join "${data.jamName}" with your team "${data.teamName}"`
                  : `Team "${data.teamName}" wants to join "${data.jamName}"`}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {type === "invitation" 
                  ? `You've been invited to join this jam with your team`
                  : `This team has requested to join your jam`}
              </p>
              {data.message && (
                <p className="mt-2 text-sm border-l-2 pl-2 py-1 border-primary/20 bg-accent/50 rounded italic">
                  "{data.message}"
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(data.createdAt)}</span>
          {type === "invitation" && "expiresAt" in data && (
            <span>Expires: {formatDate(data.expiresAt)}</span>
          )}
        </div>
        
        <div className="flex gap-2 items-center justify-between mt-1">
          <div className="flex gap-2">
            <Link 
              href={type === "invitation" ? `/jams/${data.jamSlug}` : `/teams/${data.teamSlug}`} 
              className="text-xs text-primary hover:underline"
            >
              {type === "invitation" ? "View jam" : "View team"}
            </Link>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  <span>Decline</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  <span>Accept</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 