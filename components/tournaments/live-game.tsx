'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Trophy, Zap } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'

interface LiveGameProps {
  matchId: string
  whitePlayer: { name: string; rating: number }
  blackPlayer: { name: string; rating: number }
  timeControl: string
}

interface GameState {
  fen: string
  moves: string[]
  whiteTime: number
  blackTime: number
  result?: string
  currentTurn: 'white' | 'black'
}

export function LiveGame({ matchId, whitePlayer, blackPlayer, timeControl }: LiveGameProps) {
  const { socket, isConnected } = useSocket()
  const [gameState, setGameState] = useState<GameState>({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    whiteTime: 0,
    blackTime: 0,
    currentTurn: 'white'
  })
  const [isSpectating, setIsSpectating] = useState(false)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Join the game room
    socket.emit('join-game', matchId)

    // Listen for game state updates
    socket.on('game-state', (state: GameState) => {
      setGameState(state)
    })

    // Listen for move events
    socket.on('move-made', (data: { move: string; newFen: string }) => {
      setGameState(prev => ({
        ...prev,
        fen: data.newFen,
        moves: [...prev.moves, data.move],
        currentTurn: prev.currentTurn === 'white' ? 'black' : 'white'
      }))
    })

    // Listen for game result
    socket.on('game-result', (result: string) => {
      setGameState(prev => ({ ...prev, result }))
    })

    return () => {
      socket.emit('leave-game', matchId)
      socket.off('game-state')
      socket.off('move-made')
      socket.off('game-result')
    }
  }, [socket, isConnected, matchId])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleSpectate = () => {
    if (socket) {
      socket.emit('spectate-game', matchId)
      setIsSpectating(true)
    }
  }

  const renderChessBoard = () => {
    // Simplified board representation
    // In a real implementation, you'd use a chess board library like chess.js + chessground
    return (
      <div className="chess-board w-64 h-64 mx-auto">
        {/* Board squares would be rendered here */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Chess Board Visualization
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Game</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            <Zap className="w-3 h-3 mr-1" />
            {isConnected ? 'Live' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Info - White */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${gameState.currentTurn === 'white' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">White</span>
                <Badge variant="secondary">{formatTime(gameState.whiteTime)}</Badge>
              </div>
              <div className="text-lg font-bold">{whitePlayer.name}</div>
              <div className="text-sm text-muted-foreground">Rating: {whitePlayer.rating}</div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex flex-col items-center justify-center">
            {renderChessBoard()}
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground">Time Control: {timeControl}</div>
              {gameState.result && (
                <Badge className="mt-2" variant="default">
                  <Trophy className="w-3 h-3 mr-1" />
                  Result: {gameState.result}
                </Badge>
              )}
            </div>
          </div>

          {/* Player Info - Black */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${gameState.currentTurn === 'black' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Black</span>
                <Badge variant="secondary">{formatTime(gameState.blackTime)}</Badge>
              </div>
              <div className="text-lg font-bold">{blackPlayer.name}</div>
              <div className="text-sm text-muted-foreground">Rating: {blackPlayer.rating}</div>
            </div>
          </div>
        </div>

        {/* Move List */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Move History</h4>
          <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1 text-sm">
              {gameState.moves.map((move, index) => (
                <div key={index} className="flex">
                  <span className="w-8 text-muted-foreground">{Math.floor(index / 2) + 1}.</span>
                  <span className="flex-1">{move}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spectator Controls */}
        {!isSpectating && (
          <div className="mt-6 text-center">
            <Button onClick={handleSpectate} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Spectate Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}