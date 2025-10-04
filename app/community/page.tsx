'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Users,
  Target,
  TrendingUp,
  Crown,
  Medal,
  Star,
  Award,
  Calendar,
  BarChart3,
  Swords,
  Zap
} from 'lucide-react'

export default function CommunityPage() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalPlayers: 0,
    totalMatches: 0,
    activeTournaments: 0
  })
  const [topPlayers, setTopPlayers] = useState([])
  const [topClubs, setTopClubs] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityStats()
  }, [])

  const fetchCommunityStats = async () => {
    try {
      // Fetch tournaments stats
      const tournamentsRes = await fetch('/api/tournaments?limit=100')
      const tournamentsData = await tournamentsRes.json()

      // Calculate stats
      const totalTournaments = tournamentsData.totalCount || 0
      const activeTournaments = tournamentsData.tournaments?.filter((t: any) =>
        t.status === 'ONGOING' || t.status === 'SCHEDULED'
      ).length || 0

      const totalPlayers = tournamentsData.tournaments?.reduce((sum: number, t: any) =>
        sum + (t._count?.players || 0), 0
      ) || 0

      const totalMatches = tournamentsData.tournaments?.reduce((sum: number, t: any) =>
        sum + (t._count?.matches || 0), 0
      ) || 0

      setStats({
        totalTournaments,
        totalPlayers,
        totalMatches,
        activeTournaments
      })

      // Mock top players and clubs data (in real app, fetch from API)
      setTopPlayers([
        { name: 'Magnus Carlsen', rating: 2850, tournaments: 45, wins: 38 },
        { name: 'Fabiano Caruana', rating: 2800, tournaments: 42, wins: 35 },
        { name: 'Ding Liren', rating: 2780, tournaments: 38, wins: 32 },
        { name: 'Ian Nepomniachtchi', rating: 2760, tournaments: 40, wins: 30 },
        { name: 'Wesley So', rating: 2750, tournaments: 37, wins: 28 }
      ])

      setTopClubs([
        { name: 'Norway Chess Club', members: 1250, avgRating: 2450, tournaments: 15 },
        { name: 'St. Louis Chess Club', members: 980, avgRating: 2380, tournaments: 12 },
        { name: 'Berlin Chess Academy', members: 1450, avgRating: 2350, tournaments: 18 },
        { name: 'Moscow Chess School', members: 2100, avgRating: 2320, tournaments: 25 },
        { name: 'London Chess Club', members: 890, avgRating: 2280, tournaments: 10 }
      ])

      setRecentActivity([
        { type: 'tournament', message: 'World Championship 2024 completed', time: '2 hours ago' },
        { type: 'player', message: 'Magnus Carlsen achieved 2900+ rating', time: '5 hours ago' },
        { type: 'club', message: 'Norway Chess Club won inter-club championship', time: '1 day ago' },
        { type: 'achievement', message: '50 tournaments completed this month', time: '2 days ago' }
      ])

    } catch (error) {
      console.error('Failed to fetch community stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chess Community Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow chess enthusiasts, track achievements, and celebrate the community's success
          </p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-blue-200 transition-colors">
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

        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">active participants</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">matches completed</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-orange-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">community average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Top Players Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span>Top Players</span>
            </CardTitle>
            <CardDescription>Highest rated players in our community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div key={player.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.tournaments} tournaments • {player.wins} wins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{player.rating}</p>
                    <Badge variant="secondary" className="text-xs">
                      {index === 0 ? 'Champion' : index === 1 ? 'Runner-up' : 'Top Player'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clubs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span>Top Clubs</span>
            </CardTitle>
            <CardDescription>Most active and successful chess clubs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClubs.map((club, index) => (
                <div key={club.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-purple-500 text-white' :
                      index === 1 ? 'bg-indigo-500 text-white' :
                      index === 2 ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {club.members} members • {club.tournaments} tournaments
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{club.avgRating}</p>
                    <p className="text-xs text-muted-foreground">avg rating</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Achievements */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-500" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest community achievements and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'tournament' ? 'bg-blue-100' :
                    activity.type === 'player' ? 'bg-green-100' :
                    activity.type === 'club' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'tournament' && <Trophy className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'player' && <Star className="w-4 h-4 text-green-600" />}
                    {activity.type === 'club' && <Award className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'achievement' && <Medal className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="w-5 h-5 text-orange-500" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>Community milestones unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">100 Tournaments</p>
                <p className="text-sm opacity-90">Completed!</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg text-white">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">500+ Players</p>
                <p className="text-sm opacity-90">Active members</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg text-white">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">10,000+ Games</p>
                <p className="text-sm opacity-90">Played this year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Join the Community</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be part of the growing chess community. Create tournaments, compete with players worldwide, and climb the leaderboards.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg">
                <Trophy className="w-5 h-5 mr-2" />
                Create Tournament
              </Button>
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}