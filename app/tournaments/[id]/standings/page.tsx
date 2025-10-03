'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'

export default function TournamentStandingsPage() {
  const params = useParams()
  const [tournament, setTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    minRating: '',
    maxRating: '',
    showTopOnly: false,
    sortBy: 'score'
  })

  useEffect(() => {
    if (params.id) {
      fetchTournament()
      fetchPlayers()
    }
  }, [params.id])

  useEffect(() => {
    if (!params.id) return

    const channel = supabase
      .channel('players-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `tournament_id=eq.${params.id}` }, () => {
        fetchPlayers(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  const applyFilters = (playerList = players) => {
    let filtered = [...playerList]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(player =>
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        (player.title && player.title.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Rating filters
    if (filters.minRating) {
      filtered = filtered.filter(player => (player.rating || 0) >= parseInt(filters.minRating))
    }
    if (filters.maxRating) {
      filtered = filtered.filter(player => (player.rating || 0) <= parseInt(filters.maxRating))
    }

    // Top players only
    if (filters.showTopOnly) {
      filtered = filtered.slice(0, 10)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          if (b.score !== a.score) return b.score - a.score
          return (b.rating || 0) - (a.rating || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        default:
          return 0
      }
    })

    setFilteredPlayers(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [filters, players])

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

  const fetchPlayers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch(`/api/tournaments/${params.id}/players`)
      if (response.ok) {
        const data = await response.json()
        // Sort players by score (descending) and then by rating (descending)
        const sortedPlayers = data.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return (b.rating || 0) - (a.rating || 0)
        })
        setPlayers(data)
        applyFilters(data)
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
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
            <h1 className="text-3xl font-bold">Tournament Standings</h1>
            <p className="text-gray-600">
              {tournament ? `${tournament.name} - Current Rankings` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/tournaments/${params.id}/players`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Manage Players
            </button>
          </Link>
          <button onClick={() => fetchPlayers(true)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center space-x-2" disabled={refreshing}>
            {refreshing && <Spinner className="h-4 w-4" />}
            <span>Refresh</span>
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Export Results
          </button>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-green-600">
            {players.filter(p => p.score > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Players</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {tournament?.currentRound || 0}
          </div>
          <div className="text-sm text-gray-600">Current Round</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border text-center">
          <div className="text-2xl font-bold text-orange-600">
            {players.reduce((sum, p) => sum + (p.score || 0), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter & Sort Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search by Name</label>
            <input
              type="text"
              placeholder="Player name or title..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Rating</label>
            <input
              type="number"
              placeholder="e.g., 1500"
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Rating</label>
            <input
              type="number"
              placeholder="e.g., 2500"
              value={filters.maxRating}
              onChange={(e) => setFilters({...filters, maxRating: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="score">Points (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="name">Name (A to Z)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showTopOnly}
              onChange={(e) => setFilters({...filters, showTopOnly: e.target.checked})}
              className="mr-2"
            />
            Show Top 10 Only
          </label>
          <button
            onClick={() => setFilters({
              search: '',
              minRating: '',
              maxRating: '',
              showTopOnly: false,
              sortBy: 'score'
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Standings Table */}
      <div className={`bg-white rounded-lg shadow border overflow-hidden transition-opacity duration-500 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Current Standings</h2>
          <p className="text-gray-600 text-sm">
            Rankings based on points scored • Showing {filteredPlayers.length} of {players.length} players
          </p>
        </div>

        {players.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No players in this tournament yet.</p>
            <Link href={`/tournaments/${params.id}/players`}>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add Players
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player, index) => (
                  <tr key={player.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-black' :
                          index === 1 ? 'bg-gray-300 text-black' :
                          index === 2 ? 'bg-orange-400 text-black' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {player.firstName} {player.lastName}
                          </div>
                          {player.title && (
                            <div className="text-sm text-gray-500">{player.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.rating || 'Unrated'}
                      {player.ratingType && player.rating && (
                        <span className="text-gray-500 ml-1">({player.ratingType})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">
                        {player.score || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* This would need to be calculated from matches */}
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        player.score > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.score > 0 ? 'Active' : 'No Games'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      {players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <div className="space-y-3">
              {filteredPlayers.slice(0, 3).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-black' :
                      index === 1 ? 'bg-gray-300 text-black' :
                      'bg-orange-400 text-black'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{player.firstName} {player.lastName}</span>
                  </div>
                  <span className="font-bold">{player.score || 0} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>2000+</span>
                <span>{filteredPlayers.filter(p => (p.rating || 0) >= 2000).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>1800-1999</span>
                <span>{filteredPlayers.filter(p => p.rating >= 1800 && p.rating < 2000).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>1600-1799</span>
                <span>{filteredPlayers.filter(p => p.rating >= 1600 && p.rating < 1800).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Under 1600</span>
                <span>{filteredPlayers.filter(p => (p.rating || 0) < 1600).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Tournament Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Round Progress</span>
                  <span>{tournament?.currentRound || 0}/{tournament?.rounds || 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${((tournament?.currentRound || 0) / (tournament?.rounds || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {tournament?.status === 'ONGOING' ? 'Tournament in progress' :
                 tournament?.status === 'COMPLETED' ? 'Tournament completed' :
                 'Registration phase'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}