'use client'

import { useState, useEffect } from 'react'
import { useSocket } from '@/lib/socket-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LiveGameProps {
  matchId: string
}

interface GameState {
  moves: string[]
  currentFEN: string
  whiteTime: number
  blackTime: number
  result?: string
}

export function LiveGame({ matchId }: LiveGameProps) {
  const { socket, isConnected } = useSocket()
  const [gameState, setGameState] = useState<GameState>({
    moves: [],
    currentFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    whiteTime: 0,
    blackTime: 0,
  })
  const [moveInput, setMoveInput] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.emit('join-game', matchId)

    socket.on('game-state', (state: GameState) => {
      setGameState(state)
    })

    return () => {
      socket.emit('leave-game', matchId)
    }
  }, [socket, matchId])

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !moveInput) return

    socket.emit('make-move', { matchId, move: moveInput })
    setMoveInput('')
  }

  if (!isConnected) {
    return <div>Connecting to game server...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            {/* Chess board representation would go here */}
            <div className="bg-chess-light p-4 rounded">
              Current FEN: {gameState.currentFEN}
            </div>
            <div className="mt-4">
              <strong>Moves:</strong>
              <div className="flex flex-wrap">
                {gameState.moves.map((move, index) => (
                  <span key={index} className="mr-2">
                    {index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ''} {move}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <div>
                <Label>White Time</Label>
                <div>{formatTime(gameState.whiteTime)}</div>
              </div>
              <div>
                <Label>Black Time</Label>
                <div>{formatTime(gameState.blackTime)}</div>
              </div>
              <form onSubmit={handleMoveSubmit} className="flex space-x-2">
                <Input
                  value={moveInput}
                  onChange={(e) => setMoveInput(e.target.value)}
                  placeholder="Enter move (e.g., e4)"
                />
                <Button type="submit">Send</Button>
              </form>
              {gameState.result && (
                <div className="font-bold">Result: {gameState.result}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
}