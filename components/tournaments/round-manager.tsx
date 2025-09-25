'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit
} from 'lucide-react'

interface Round {
  id: string
  number: number
  isCompleted: boolean
  startTime: string
  endTime?: string
  matches: Match[]
}

interface Match {
  id: string
  boardNumber: number
  whitePlayer: { id: string; name: string; rating: number }
  blackPlayer: { id: string; name: string; rating: number }
  result?: string
  startTime?: string
  endTime?: string
}

interface RoundManagerProps {
  rounds: Round[]
  currentRound: number
  tournamentId: string
  onRoundChange: (roundNumber: number) => void
}

export function RoundManager({ rounds, currentRound, tournamentId, onRoundChange }: RoundManagerProps) {
  const [selectedRound, setSelectedRound] = useState(currentRound)
  const [isGenerating, setIsGenerating] = useState(false)

  const currentRoundData = rounds.find(r => r.number === selectedRound)
  const canGenerateNextRound = currentRoundData?.isCompleted && selectedRound === currentRound

  const handleGeneratePairings = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/rounds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber: selectedRound + 1 })
      })
      
      if (response.ok) {
        onRoundChange(selectedRound + 1)
        setSelectedRound(selectedRound + 1)
      }
    } catch (error) {
      console.error('Failed to generate pairings:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitResult = async (matchId: string, result: string) => {
    try {
      await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      })
      // Refresh data
      onRoundChange(selectedRound)
    } catch (error) {
      console.error('Failed to submit result:', error)
    }
  }

  const getResultOptions = () => [
    { value: '1-0', label: '1-0 (White wins)' },
    { value: '0-1', label: '0-1 (Black wins)' },
    { value: '½-½', label: '½-½ (Draw)' },
    { value: '0-0', label: '0-0 (No result)' }
  ]

  return (
    <div className="space-y-6">
      {/* Round Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedRound(Math.max(1, selectedRound - 1))}
                disabled={selectedRound === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-2xl font-bold">Round {selectedRound}</div>
                <div className="text-sm text-muted-foreground">
                  {currentRoundData?.isCompleted ? 'Completed' : 'In Progress'}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedRound(Math.min(rounds.length, selectedRound + 1))}
                disabled={selectedRound === rounds.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={selectedRound.toString()} onValueChange={(value) => setSelectedRound(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map(round => (
                    <SelectItem key={round.id} value={round.number.toString()}>
                      Round {round.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {canGenerateNextRound && (
                <Button onClick={handleGeneratePairings} disabled={isGenerating}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Next Round'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Round {selectedRound} Pairings</span>
            <Badge variant={currentRoundData?.isCompleted ? "default" : "secondary"}>
              {currentRoundData?.matches.length || 0} Boards
            </Badge>
          </CardTitle>
          <CardDescription>
            {currentRoundData?.isCompleted ? 'Round completed' : 'Matches in progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Board</TableHead>
                <TableHead>White Player</TableHead>
                <TableHead>Black Player</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRoundData?.matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-mono font-bold">#{match.boardNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.whitePlayer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {match.whitePlayer.rating}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.blackPlayer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {match.blackPlayer.rating}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {match.result ? (
                        <Badge variant="default" className="font-mono">
                          {match.result}
                        </Badge>
                      ) : (
                        <Select onValueChange={(value) => handleSubmitResult(match.id, value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Result" />
                          </SelectTrigger>
                          <SelectContent>
                            {getResultOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge variant={match.result ? "default" : "secondary"} className="flex items-center space-x-1">
                        {match.result ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{match.result ? 'Completed' : 'Pending'}</span>
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Round Statistics */}
      {currentRoundData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{currentRoundData.matches.length * 2}</div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {currentRoundData.matches.filter(m => m.result).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Results In</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {currentRoundData.matches.filter(m => !m.result).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((currentRoundData.matches.filter(m => m.result).length / currentRoundData.matches.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}