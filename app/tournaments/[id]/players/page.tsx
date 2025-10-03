'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function TournamentPlayersPage() {
  const params = useParams()
  const [tournament, setTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rating: '',
    ratingType: 'FIDE',
    title: '',
    federation: '',
    lichessUsername: '',
    blitzRating: '',
    rapidRating: '',
    classicalRating: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchTournament()
      fetchPlayers()
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

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/players`)
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLichessRatings = async () => {
    if (!formData.lichessUsername.trim()) {
      alert('Please enter a Lichess username')
      return
    }
    try {
      const response = await fetch(`/api/lichess/${formData.lichessUsername.trim()}`)
      if (response.ok) {
        const ratings = await response.json()
        setFormData({
          ...formData,
          blitzRating: ratings.blitz || '',
          rapidRating: ratings.rapid || '',
          classicalRating: ratings.classical || '',
          rating: ratings.blitz ? ratings.blitz.toString() : formData.rating // set rating to blitz if available
        })
        alert('Ratings fetched successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to fetch ratings: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to fetch Lichess ratings:', error)
      alert('Failed to fetch ratings. Please try again.')
    }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/tournaments/${params.id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating ? parseInt(formData.rating) : null,
          blitzRating: formData.blitzRating ? parseInt(formData.blitzRating) : null,
          rapidRating: formData.rapidRating ? parseInt(formData.rapidRating) : null,
          classicalRating: formData.classicalRating ? parseInt(formData.classicalRating) : null
        })
      })

      if (response.ok) {
        const newPlayer = await response.json()
        setPlayers([...players, newPlayer])
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          rating: '',
          ratingType: 'FIDE',
          title: '',
          federation: '',
          lichessUsername: '',
          blitzRating: '',
          rapidRating: '',
          classicalRating: ''
        })
        setShowAddForm(false)
        alert('Player added successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to add player: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to add player:', error)
      alert('Failed to add player. Please check the console for details.')
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
      <div className="flex items-center space-x-4">
        <Link href={`/tournaments/${params.id}`} className="bg-gray-200 px-3 py-2 rounded">
          ← Back to Tournament
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Player Management</h1>
          <p className="text-gray-600">
            {tournament ? `Manage players for ${tournament.name}` : 'Loading tournament...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Entry */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
          <p className="text-gray-600 mb-4">
            Add players individually with their ratings and information.
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showAddForm ? 'Cancel' : 'Add Player Manually'}
          </button>
        </div>

        {/* Bulk Import */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Bulk Import</h3>
          <p className="text-gray-600 mb-4">
            Import players from CSV or copy/paste from existing lists.
          </p>
          <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Import Players
          </button>
        </div>
      </div>

      {/* Add Player Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Add New Player</h3>
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lichess Username</label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.lichessUsername}
                  onChange={(e) => setFormData({...formData, lichessUsername: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Enter Lichess username to fetch ratings"
                />
                <button
                  type="button"
                  onClick={fetchLichessRatings}
                  className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Fetch Ratings
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Add Player
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Players */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Current Players ({players.length})</h3>

        {players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No players added yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Use the options above to add players to this tournament.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{player.firstName} {player.lastName}</p>
                    <p className="text-sm text-gray-600">
                      Rating: {player.rating || 'Unrated'} | Score: {player.score || 0}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">
                    Edit
                  </button>
                  <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}