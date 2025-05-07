"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, UserPlus, Search } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { jamTeamApi } from "@/lib/api/jam-team"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface Team {
  id: string
  name: string
  slug: string
}

interface JamTeamInviteButtonProps {
  jamId: string
  jamName: string
  className?: string
  searchTeams: (query: string) => Promise<Team[]>
}

export function JamTeamInviteButton({
  jamId,
  jamName,
  className,
  searchTeams
}: JamTeamInviteButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [message, setMessage] = useState("")
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  useEffect(() => {
    const fetchTeams = async () => {
      if (!debouncedSearchQuery) {
        setSearchResults([])
        return
      }
      
      setIsSearching(true)
      try {
        const teams = await searchTeams(debouncedSearchQuery)
        setSearchResults(teams)
      } catch (error) {
        console.error("Error searching teams:", error)
      } finally {
        setIsSearching(false)
      }
    }
    
    fetchTeams()
  }, [debouncedSearchQuery, searchTeams])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTeam) {
      toast.error("Please select a team")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await jamTeamApi.createJamTeamInvitation(jamId, {
        teamId: selectedTeam.id,
        message: message || undefined
      })
      
      toast.success(`Invitation sent to ${selectedTeam.name}!`)
      setIsOpen(false)
      setSelectedTeam(null)
      setMessage("")
      router.refresh()
    } catch (error: any) {
      console.error("Error inviting team:", error)
      const errorMessage = error?.response?.data?.message || "Failed to send invitation"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a team to {jamName}</DialogTitle>
          <DialogDescription>
            Search for a team to invite to this jam.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="team" className="text-sm font-medium">
              Team
            </label>
            
            {selectedTeam ? (
              <div className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {selectedTeam.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{selectedTeam.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTeam(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Search teams..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isSearching ? (
                    <div className="py-6 text-center text-sm">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <>
                      <CommandEmpty>No teams found.</CommandEmpty>
                      <CommandGroup heading="Results">
                        {searchResults.map((team) => (
                          <CommandItem
                            key={team.id}
                            onSelect={() => {
                              setSelectedTeam(team)
                              setSearchQuery("")
                            }}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {team.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {team.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <Search className="mx-auto h-4 w-4" />
                      <p className="mt-2">Start typing to search for teams</p>
                    </div>
                  )}
                </CommandList>
              </Command>
            )}
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (optional)
            </label>
            <Textarea
              id="message"
              placeholder="Why you're inviting this team..."
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
            <Button type="submit" disabled={isSubmitting || !selectedTeam}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 