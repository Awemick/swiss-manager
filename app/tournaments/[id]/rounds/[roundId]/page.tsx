'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function RoundDetailsPage() {
  const params = useParams()
  const [round, setRound] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [pgnFiles, setPgnFiles] = useState({})
  const [viewingGame, setViewingGame] = useState(null)

  useEffect(() => {
    if (params.roundId) {
      fetchRoundDetails()
    }
  }, [params.roundId])

  const fetchRoundDetails = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/rounds/${params.roundId}`)
      if (response.ok) {
        const data = await response.json()
        setRound(data.round)
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Failed to fetch round details:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMatchResult = async (matchId, result) => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/rounds/${params.roundId}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      })

      if (response.ok) {
        // Update local state
        setMatches(matches.map(match =>
          match.id === matchId ? { ...match, result } : match
        ))
      } else {
        alert('Failed to update match result')
      }
    } catch (error) {
      console.error('Failed to update match:', error)
      alert('Failed to update match result')
    }
  }

  const getResultButtonClass = (currentResult, buttonResult) => {
    return currentResult === buttonResult
      ? 'bg-blue-500 text-white'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  }

  const setPgnFile = (matchId, file) => {
    setPgnFiles({ ...pgnFiles, [matchId]: file })
  }

  const uploadPgn = async (matchId) => {
    const file = pgnFiles[matchId]
    if (!file) return

    const formData = new FormData()
    formData.append('pgn', file)

    try {
      const response = await fetch(`/api/matches/${matchId}/pgn`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('PGN uploaded successfully')
        fetchRoundDetails() // refresh
      } else {
        const error = await response.json()
        alert('Failed to upload PGN: ' + error.error)
      }
    } catch (error) {
      alert('Failed to upload PGN')
    }
  }

  const viewGame = (match) => {
    setViewingGame(match)
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
          <Link href={`/tournaments/${params.id}/rounds`} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
            ← Back to Rounds
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Round {round?.number} Details</h1>
            <p className="text-gray-600">
              Enter match results and manage pairings
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/tournaments/${params.id}/standings`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View Standings
            </button>
          </Link>
        </div>
      </div>

      {/* Round Info */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Round {round?.number}</h2>
            <p className="text-gray-600">
              Started: {round?.startTime ? new Date(round.startTime).toLocaleString() : 'Not started'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded text-sm font-medium ${
            round?.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {round?.isCompleted ? 'Completed' : 'In Progress'}
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Matches</h2>
          <p className="text-gray-600 text-sm">Click result buttons to record outcomes</p>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No matches in this round yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {matches.map((match) => (
              <div key={match.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Board</div>
                      <div className="text-lg font-bold">{match.boardNumber}</div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* White Player */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold mb-1">
                          W
                        </div>
                        <div className="text-sm font-medium">
                          {match.whitePlayer?.firstName} {match.whitePlayer?.lastName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {match.whitePlayer?.rating || 'Unrated'}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">vs</div>
                      </div>

                      {/* Black Player */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1">
                          B
                        </div>
                        <div className="text-sm font-medium">
                          {match.blackPlayer?.firstName} {match.blackPlayer?.lastName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {match.blackPlayer?.rating || 'Unrated'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Result Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateMatchResult(match.id, 'WHITE_WIN')}
                      className={`px-3 py-1 rounded text-sm ${getResultButtonClass(match.result, 'WHITE_WIN')}`}
                    >
                      1-0
                    </button>
                    <button
                      onClick={() => updateMatchResult(match.id, 'DRAW')}
                      className={`px-3 py-1 rounded text-sm ${getResultButtonClass(match.result, 'DRAW')}`}
                    >
                      ½-½
                    </button>
                    <button
                      onClick={() => updateMatchResult(match.id, 'BLACK_WIN')}
                      className={`px-3 py-1 rounded text-sm ${getResultButtonClass(match.result, 'BLACK_WIN')}`}
                    >
                      0-1
                    </button>
                  </div>
                </div>

                {/* Current Result Display */}
                {match.result && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">Result: </span>
                    <span className="font-medium">
                      {match.result === 'WHITE_WIN' && 'White Wins (1-0)'}
                      {match.result === 'DRAW' && 'Draw (½-½)'}
                      {match.result === 'BLACK_WIN' && 'Black Wins (0-1)'}
                    </span>
                  </div>
                )}

                {/* PGN Upload/View */}
                {match.moves ? (
                  <div className="mt-4 flex items-center space-x-4">
                    <span className="text-sm text-green-600">PGN uploaded</span>
                    <button onClick={() => viewGame(match)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">View Game</button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center space-x-4">
                    <input type="file" accept=".pgn" onChange={(e) => setPgnFile(match.id, e.target.files?.[0])} className="text-sm" />
                    <button onClick={() => uploadPgn(match.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Upload PGN</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Round Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.result).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => !m.result).length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {matches.filter(m => m.result === 'DRAW').length}
          </div>
          <div className="text-sm text-gray-600">Draws</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Enter Results</h3>
        <div className="text-blue-700 space-y-2">
          <p><strong>1-0:</strong> White player wins</p>
          <p><strong>½-½:</strong> Game ends in a draw</p>
          <p><strong>0-1:</strong> Black player wins</p>
          <p><strong>Tip:</strong> Click the result buttons to record outcomes. Standings will update automatically when the round is completed.</p>
        </div>
      </div>

      {/* Game Viewer Modal */}
      {viewingGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Game Viewer</h3>
              <button onClick={() => setViewingGame(null)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="space-y-2">
              <p><strong>White:</strong> {viewingGame.whitePlayer?.firstName} {viewingGame.whitePlayer?.lastName}</p>
              <p><strong>Black:</strong> {viewingGame.blackPlayer?.firstName} {viewingGame.blackPlayer?.lastName}</p>
              <p><strong>Result:</strong> {viewingGame.result}</p>
              {viewingGame.opening && <p><strong>Opening:</strong> {viewingGame.opening}</p>}
              {viewingGame.eco_code && <p><strong>ECO:</strong> {viewingGame.eco_code}</p>}
              {viewingGame.num_moves && <p><strong>Moves:</strong> {viewingGame.num_moves}</p>}
              <div>
                <strong>PGN:</strong>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-2 whitespace-pre-wrap">{viewingGame.moves}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}