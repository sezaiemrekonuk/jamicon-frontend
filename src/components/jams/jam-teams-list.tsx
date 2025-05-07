"use client"

import * as React from "react"
import { useState } from "react"
import { Users, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { jamTeamApi } from "@/lib/api/jam-team"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Team {
  id: string
  name: string
  slug: string
}

interface JamTeamsListProps {
  jamId: string
  jamName: string
  teams: Team[]
  canManage: boolean
  className?: string
}

export function JamTeamsList({ jamId, jamName, teams, canManage, className }: JamTeamsListProps) {
  const router = useRouter()
  const [teamToRemove, setTeamToRemove] = useState<Team | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const handleRemoveTeam = async () => {
    if (!teamToRemove) return
    
    setIsRemoving(true)
    try {
      await jamTeamApi.removeTeamFromJam(jamId, teamToRemove.id)
      toast.success(`${teamToRemove.name} has been removed from ${jamName}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error removing team:", error)
      const errorMessage = error?.response?.data?.message || "Failed to remove team"
      toast.error(errorMessage)
    } finally {
      setIsRemoving(false)
      setTeamToRemove(null)
    }
  }
  
  if (teams.length === 0) {
    return (
      <div className={cn("text-center p-6", className)}>
        <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No teams are participating in this jam yet.</p>
      </div>
    )
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participating Teams
          </CardTitle>
          <CardDescription>
            {teams.length} {teams.length === 1 ? 'team is' : 'teams are'} participating in this jam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{team.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link 
                      href={`/teams/${team.slug}`}
                      className="font-medium hover:underline"
                    >
                      {team.name}
                    </Link>
                  </div>
                </div>
                
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTeamToRemove(team)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!teamToRemove} onOpenChange={(open: boolean) => !open && setTeamToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team from jam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {teamToRemove?.name} from {jamName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                handleRemoveTeam()
              }}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 