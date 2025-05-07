"use client"

import * as React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, SendHorizonal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { jamTeamApi } from "@/lib/api/jam-team"
import { useRouter } from "next/navigation"

interface Team {
  id: string
  name: string
}

interface JamTeamRequestButtonProps {
  jamId: string
  jamName: string
  jamSlug: string
  userTeams: Team[]
  className?: string
}

export function JamTeamRequestButton({
  jamId,
  jamName,
  jamSlug,
  userTeams,
  className
}: JamTeamRequestButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [message, setMessage] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTeamId) {
      toast.error("Please select a team")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await jamTeamApi.createJamTeamRequest(jamId, {
        teamId: selectedTeamId,
        message: message || undefined
      })
      
      toast.success(`Request sent to join ${jamName}!`)
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error requesting to join jam:", error)
      const errorMessage = error?.response?.data?.message || "Failed to send request"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // If user has no teams, don't show the button
  if (!userTeams.length) {
    return null
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className={className}>
          Request to Join with Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request to join {jamName}</DialogTitle>
          <DialogDescription>
            Select a team to request participation in this jam.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="team" className="text-sm font-medium">
              Team
            </label>
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {userTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (optional)
            </label>
            <Textarea
              id="message"
              placeholder="Why you want to join this jam..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedTeamId}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SendHorizonal className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 