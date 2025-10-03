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
  ArrowRight,
  Shield,
  Zap,
  Target,
  Award,
  Crown,
  Swords,
  BarChart3,
  Gamepad2,
  Building2,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/supabase-provider'

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
  const { user } = useAuth()
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
      const response = await fetch('/api/tournaments?limit=6')
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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <Crown className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chess Tournament Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional tournament management with real-time updates, Lichess integration,
            and advanced analytics for chess organizations worldwide.
          </p>
        </div>

        {!user ? (
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                <Star className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/tournaments/new">
              <Button size="lg" className="px-8">
                <Plus className="w-5 h-5 mr-2" />
                Create Tournament
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Real-Time Updates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Live standings, pairings, and results update instantly across all devices.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Lichess Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Automatically fetch player ratings from Lichess with one-click import.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Club Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Organize tournaments by clubs with inter-club competitions and statistics.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-orange-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">PGN Game Import</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload PGN files, parse games, and store complete game analysis.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-red-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Role-Based Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Secure permissions for organizers, players, and spectators.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-teal-200 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-lg">Advanced Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Performance tracking, statistics, and tournament insights.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      {user && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Your Tournament Dashboard</h2>
            <p className="text-muted-foreground">Track your chess tournament activities</p>
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
                <Swords className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedMatches}</div>
                <p className="text-xs text-muted-foreground">games completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2450</div>
                <p className="text-xs text-muted-foreground">average tournament rating</p>
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
                {tournaments.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first tournament to get started with professional chess management.
                    </p>
                    <Link href="/tournaments/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Tournament
                      </Button>
                    </Link>
                  </div>
                ) : (
                  tournaments.map((tournament) => (
                    <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                          {tournament.location && <span>{tournament.location}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/tournaments/${tournament.id}/standings`}>
                          <Button variant="outline" size="sm">
                            Standings
                          </Button>
                        </Link>
                        <Link href={`/tournaments/${tournament.id}`}>
                          <Button size="sm">
                            Manage
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action for Non-Authenticated Users */}
      {!user && (
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ready to Start Managing Tournaments?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join thousands of chess organizers using our professional tournament management platform.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg">
                  <Crown className="w-5 h-5 mr-2" />
                  Become an Organizer
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}