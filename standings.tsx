'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter, Trophy, TrendingUp, Target } from 'lucide-react'

interface Standing {
  rank: number
  player: {
    id: string
    firstName: string
    lastName: string
    rating: number
    ratingType: string
    title?: string
    federation?: string
  }
  score: number
  buchholz: number
  sonnebornBerger: number
  performance: number
  roundsPlayed: number
  previousRank?: number
}

interface StandingsProps {
  standings: Standing[]
  tournamentId: string
}

export function Standings({ standings, tournamentId }: StandingsProps) {
  const [sortBy, setSortBy] = useState<'score' | 'buchholz' | 'sonnebornBerger' | 'performance'>('score')
  const [showTiebreaks, setShowTiebreaks] = useState(false)

  const sortedStandings = [...standings].sort((a, b) => {
    switch (sortBy) {
      case 'buchholz':
        return b.buchholz - a.buchholz
      case 'sonnebornBerger':
        return b.sonnebornBerger - a.sonnebornBerger
      case 'performance':
        return b.performance - a.performance
      default:
        if (b.score !== a.score) return b.score - a.score
        return b.buchholz - a.buchholz
    }
  })

  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank) return null
    const change = previousRank - currentRank
    if (change > 0) return { type: 'up', change }
    if (change < 0) return { type: 'down', change: Math.abs(change) }
    return null
  }

  const getTitleBadge = (title?: string) => {
    if (!title) return null
    return (
      <Badge variant="secondary" className="text-xs">
        {title}
      </Badge>
    )
  }

  const exportStandings = () => {
    const csvContent = [
      ['Rank', 'Name', 'Rating', 'Score', 'Buchholz', 'Sonneborn-Berger', 'Performance'],
      ...sortedStandings.map(s => [
        s.rank,
        `${s.player.firstName} ${s.player.lastName}`,
        s.player.rating,
        s.score,
        s.buchholz.toFixed(2),
        s.sonnebornBerger.toFixed(2),
        s.performance
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `standings-${tournamentId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Tournament Standings</span>
            </CardTitle>
            <CardDescription>
              Current rankings with tiebreak calculations
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="buchholz">Buchholz</SelectItem>
                <SelectItem value="sonnebornBerger">Sonneborn-Berger</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowTiebreaks(!showTiebreaks)}>
              {showTiebreaks ? 'Hide' : 'Show'} Tiebreaks
            </Button>
            <Button variant="outline" onClick={exportStandings}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead className="text-right">Score</TableHead>
              {showTiebreaks && (
                <>
                  <TableHead className="text-right">Buchholz</TableHead>
                  <TableHead className="text-right">S-B</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </>
              )}
              <TableHead className="text-right">Rounds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStandings.map((standing) => {
              const rankChange = getRankChange(standing.rank, standing.previousRank)
              
              return (
                <TableRow key={standing.player.id} className={
                  standing.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-primary/10' : ''
                }>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        standing.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        standing.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        standing.rank === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-muted'
                      }`}>
                        {standing.rank}
                      </div>
                      {rankChange && (
                        <Badge variant={rankChange.type === 'up' ? 'default' : 'destructive'} className="text-xs">
                          {rankChange.type === 'up' ? '↑' : '↓'} {rankChange.change}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">
                          {standing.player.firstName} {standing.player.lastName}
                          {standing.rank <= 3 && (
                            <Trophy className="w-4 h-4 inline ml-2 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          {getTitleBadge(standing.player.title)}
                          {standing.player.federation && (
                            <Badge variant="outline" className="text-xs">
                              {standing.player.federation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono">{standing.player.rating}</div>
                    <div className="text-xs text-muted-foreground">{standing.player.ratingType}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-lg">{standing.score}</div>
                  </TableCell>
                  {showTiebreaks && (
                    <>
                      <TableCell className="text-right">
                        <div className="font-mono">{standing.buchholz.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono">{standing.sonnebornBerger.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{standing.performance}</span>
                        </div>
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="text-muted-foreground">{standing.roundsPlayed}</div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Legend */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>1st Place</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>2nd Place</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-100 rounded"></div>
              <span>3rd Place</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Rank Improvement</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}