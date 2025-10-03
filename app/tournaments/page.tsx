'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments')
      const data = await response.json()
      setTournaments(data.tournaments || [])
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
    } finally {
      setLoading(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Tournaments</h1>
          <p className="text-gray-600">Manage and view all chess tournaments</p>
        </div>
        <Link href="/tournaments/new" className="bg-blue-500 text-white px-4 py-2 rounded">
          New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
          <p className="text-gray-600 mb-6">Create your first tournament to get started.</p>
          <Link href="/tournaments/new" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{tournament.name}</h3>
                  <p className="text-gray-600 text-sm">{tournament.description}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {tournament.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Players: {tournament._count?.players || 0}</span>
                  <span>Matches: {tournament._count?.matches || 0}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Round {tournament.currentRound}/{tournament.rounds}</span>
                  <span>{tournament.type}</span>
                </div>
              </div>

              <Link
                href={`/tournaments/${tournament.id}`}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded text-center block hover:bg-gray-200"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}