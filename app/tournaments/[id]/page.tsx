'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'SWISS',
    rounds: 5,
    timeControl: '',
    location: '',
    director: '',
    status: 'REGISTRATION'
  })

  useEffect(() => {
    if (params.id) {
      fetchTournament()
    }
  }, [params.id])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTournament(data)
        // Initialize edit form with current data
        setEditForm({
          name: data.name || '',
          description: data.description || '',
          type: data.type || 'SWISS',
          rounds: data.rounds || 5,
          timeControl: data.timeControl || '',
          location: data.location || '',
          director: data.director || '',
          status: data.status || 'REGISTRATION'
        })
      }
    } catch (error) {
      console.error('Failed to fetch tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTournament = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/tournaments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedTournament = await response.json()
        setTournament(updatedTournament)
        setShowEditForm(false)
        alert('Tournament updated successfully!')
      } else {
        alert('Failed to update tournament')
      }
    } catch (error) {
      console.error('Failed to update tournament:', error)
      alert('Failed to update tournament')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTournament = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tournaments/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/tournaments')
      } else {
        alert('Failed to delete tournament')
      }
    } catch (error) {
      console.error('Failed to delete tournament:', error)
      alert('Failed to delete tournament')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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

  if (!tournament) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <p className="mb-6">The tournament you're looking for doesn't exist.</p>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tournaments" className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
            ← Back to Tournaments
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-gray-600">{tournament.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            tournament.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
            tournament.status === 'REGISTRATION' ? 'bg-blue-100 text-blue-800' :
            tournament.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {tournament.status}
          </span>
          <Link href={`/tournaments/${tournament.id}/players`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Manage Players
            </button>
          </Link>
          <Link href={`/tournaments/${tournament.id}/standings`}>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              View Standings
            </button>
          </Link>
          <Link href={`/tournaments/${tournament.id}/rounds`}>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Manage Rounds
            </button>
          </Link>
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Edit Tournament
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Edit Tournament</h2>
          <form onSubmit={handleUpdateTournament} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="SWISS">Swiss System</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="TEAM">Team Tournament</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rounds</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={editForm.rounds}
                  onChange={(e) => setEditForm({...editForm, rounds: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Control</label>
                <input
                  type="text"
                  value={editForm.timeControl}
                  onChange={(e) => setEditForm({...editForm, timeControl: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., 90+30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Director</label>
                <input
                  type="text"
                  value={editForm.director}
                  onChange={(e) => setEditForm({...editForm, director: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Tournament'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournament Details */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Tournament Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tournament._count?.players || 0}</div>
            <div className="text-sm text-gray-600">Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{tournament._count?.matches || 0}</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{tournament.currentRound}</div>
            <div className="text-sm text-gray-600">Current Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{tournament.rounds}</div>
            <div className="text-sm text-gray-600">Total Rounds</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Type:</strong> {tournament.type}</div>
              <div><strong>Time Control:</strong> {tournament.timeControl || 'Not set'}</div>
              <div><strong>Location:</strong> {tournament.location || 'Not set'}</div>
              <div><strong>Director:</strong> {tournament.director || 'Not set'}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Scoring System</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Win Points:</strong> {tournament.pointsWin}</div>
              <div><strong>Draw Points:</strong> {tournament.pointsDraw}</div>
              <div><strong>Loss Points:</strong> {tournament.pointsLoss}</div>
              <div><strong>Primary Tiebreak:</strong> {tournament.tiebreak1}</div>
              <div><strong>Secondary Tiebreak:</strong> {tournament.tiebreak2}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Tournament</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{tournament.name}"? This action cannot be undone and will remove all associated players and matches.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteTournament}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Tournament'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}