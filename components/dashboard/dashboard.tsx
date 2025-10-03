'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

type TournamentStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

interface Tournament {
  id: string
  name: string
  status: TournamentStatus
  currentRound: number
  rounds: number
  location: string
}

interface TournamentWithCounts extends Tournament {
  _count: {
    players: number
    matches: number
  }
  players: any[]
}

export function Dashboard() {
  const [tournaments, setTournaments] = useState<TournamentWithCounts[]>([])
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalPlayers: 0,
    completedMatches: 0
  })

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments?limit=5')
      const data = await response.json()
      setTournaments(data.tournaments)
      
      // Calculate stats
      setStats({
        totalTournaments: data.totalCount,
        activeTournaments: data.tournaments.filter((t: Tournament) =>
          t.status === 'ONGOING' || t.status === 'SCHEDULED'
        ).length,
        totalPlayers: data.tournaments.reduce((sum: number, t: TournamentWithCounts) => 
          sum + t._count.players, 0
        ),
        completedMatches: data.tournaments.reduce((sum: number, t: TournamentWithCounts) => 
          sum + t._count.matches, 0
        )
      })
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
    }
  }

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tournament Manager</h1>
          <p className="text-muted-foreground">Professional chess tournament management</p>
        </div>
        <Link href="/tournaments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tournament
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTournaments} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">across all tournaments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Played</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMatches}</div>
            <p className="text-xs text-muted-foreground">games completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">currently playing</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tournaments</CardTitle>
          <CardDescription>Your most recently active tournaments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{tournament.name}</h3>
                    <Badge variant="secondary" className={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {tournament._count.players} players
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Round {tournament.currentRound}/{tournament.rounds}
                    </span>
                    <span>{tournament.location}</span>
                  </div>
                </div>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button variant="outline" size="sm">
                    View
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}