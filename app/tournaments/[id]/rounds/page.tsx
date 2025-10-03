'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function TournamentRoundsPage() {
  const params = useParams()
  const [tournament, setTournament] = useState(null)
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTournament()
      fetchRounds()
    }
  }, [params.id])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTournament(data)
      }
    } catch (error) {
      console.error('Failed to fetch tournament:', error)
    }
  }

  const fetchRounds = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/rounds`)
      if (response.ok) {
        const data = await response.json()
        setRounds(data)
        // Find current round
        const current = data.find(round => !round.isCompleted) || data[data.length - 1]
        setCurrentRound(current)
      }
    } catch (error) {
      console.error('Failed to fetch rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const startNewRound = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/rounds`, {
        method: 'POST'
      })

      if (response.ok) {
        const newRound = await response.json()
        setRounds([...rounds, newRound])
        setCurrentRound(newRound)
        alert('New round started successfully!')
      } else {
        alert('Failed to start new round')
      }
    } catch (error) {
      console.error('Failed to start round:', error)
      alert('Failed to start new round')
    }
  }

  const completeRound = async (roundId) => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/rounds/${roundId}/complete`, {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh rounds
        fetchRounds()
        alert('Round completed successfully!')
      } else {
        alert('Failed to complete round')
      }
    } catch (error) {
      console.error('Failed to complete round:', error)
      alert('Failed to complete round')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/tournaments/${params.id}`} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
            ← Back to Tournament
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Round Management</h1>
            <p className="text-gray-600">
              {tournament ? `${tournament.name} - Round Control` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/tournaments/${params.id}/standings`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View Standings
            </button>
          </Link>
          {tournament && tournament.status === 'ONGOING' && (
            <button
              onClick={startNewRound}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start New Round
            </button>
          )}
        </div>
      </div>

      {/* Tournament Status */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Tournament Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rounds.length}</div>
            <div className="text-sm text-gray-600">Total Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rounds.filter(r => r.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600">Completed Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentRound ? currentRound.number : 0}
            </div>
            <div className="text-sm text-gray-600">Current Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tournament?.status || 'UNKNOWN'}
            </div>
            <div className="text-sm text-gray-600">Tournament Status</div>
          </div>
        </div>
      </div>

      {/* Rounds List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Rounds</h2>
          <p className="text-gray-600 text-sm">Manage tournament rounds and pairings</p>
        </div>

        {rounds.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No rounds started yet.</p>
            {tournament && tournament.status === 'ONGOING' && (
              <button
                onClick={startNewRound}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Start First Round
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rounds.map((round) => (
              <div key={round.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      round.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {round.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Round {round.number}</h3>
                      <p className="text-gray-600">
                        {round.isCompleted ? 'Completed' : 'In Progress'}
                        {round.startTime && ` • Started ${new Date(round.startTime).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/tournaments/${params.id}/rounds/${round.id}`}>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        View Details
                      </button>
                    </Link>
                    {!round.isCompleted && (
                      <button
                        onClick={() => completeRound(round.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Complete Round
                      </button>
                    )}
                  </div>
                </div>

                {/* Round Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Matches:</span> {round._count?.matches || 0}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span> {round._count?.matches || 0}
                  </div>
                  <div>
                    <span className="font-medium">Byes:</span> 0
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      round.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {round.isCompleted ? 'Finished' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How Round Management Works</h3>
        <div className="text-blue-700 space-y-2">
          <p><strong>1. Start Tournament:</strong> Change tournament status to "Ongoing" to enable round management</p>
          <p><strong>2. Generate Pairings:</strong> Click "Start New Round" to create pairings automatically</p>
          <p><strong>3. Enter Results:</strong> Go to round details to enter match results</p>
          <p><strong>4. Complete Round:</strong> Mark round as complete to update standings</p>
          <p><strong>5. Repeat:</strong> Continue until tournament reaches final round</p>
        </div>
      </div>
    </div>
  )
}