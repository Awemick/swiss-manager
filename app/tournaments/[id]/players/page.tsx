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
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rating: '',
    ratingType: 'FIDE',
    title: '',
    federation: '',
    lichessUsername: '',
    bulletRating: '',
    blitzRating: '',
    rapidRating: '',
    classicalRating: '',
    correspondenceRating: '',
    selectedLichessRating: 'blitz' // Which Lichess rating to use as main rating
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
        const data = await response.json()
        const selectedRating = data[formData.selectedLichessRating] || data.blitz || data.rapid || data.classical

        setFormData({
          ...formData,
          bulletRating: data.bullet || '',
          blitzRating: data.blitz || '',
          rapidRating: data.rapid || '',
          classicalRating: data.classical || '',
          correspondenceRating: data.correspondence || '',
          rating: selectedRating ? selectedRating.toString() : formData.rating,
          title: data.title || formData.title
        })
        alert(`Ratings fetched successfully! Using ${formData.selectedLichessRating} rating as primary.`)
      } else {
        const error = await response.json()
        alert(`Failed to fetch ratings: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to fetch Lichess ratings:', error)
      alert('Failed to fetch ratings. Please try again.')
    }
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const players = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length === headers.length) {
        const player = {}
        headers.forEach((header, index) => {
          player[header] = values[index] || ''
        })
        players.push(player)
      }
    }

    return players
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target.result
      const parsedPlayers = parseCSV(csvText)
      setImportPreview(parsedPlayers)
    }
    reader.readAsText(file)
  }

  const importPlayers = async () => {
    if (!importPreview.length) return

    setImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const playerData of importPreview) {
      try {
        const response = await fetch(`/api/tournaments/${params.id}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: playerData.firstname || playerData.first_name || playerData.first || '',
            lastName: playerData.lastname || playerData.last_name || playerData.last || '',
            email: playerData.email || '',
            rating: playerData.rating ? parseInt(playerData.rating) : null,
            ratingType: playerData.ratingtype || playerData.rating_type || 'FIDE',
            title: playerData.title || '',
            federation: playerData.federation || '',
            lichessUsername: playerData.lichessusername || playerData.lichess_username || playerData.lichess || ''
          })
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    setImporting(false)
    alert(`Import completed! ${successCount} players imported successfully, ${errorCount} failed.`)

    if (successCount > 0) {
      fetchPlayers()
      setShowImportModal(false)
      setCsvFile(null)
      setImportPreview([])
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
          bulletRating: formData.bulletRating ? parseInt(formData.bulletRating) : null,
          blitzRating: formData.blitzRating ? parseInt(formData.blitzRating) : null,
          rapidRating: formData.rapidRating ? parseInt(formData.rapidRating) : null,
          classicalRating: formData.classicalRating ? parseInt(formData.classicalRating) : null,
          correspondenceRating: formData.correspondenceRating ? parseInt(formData.correspondenceRating) : null
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
          bulletRating: '',
          blitzRating: '',
          rapidRating: '',
          classicalRating: '',
          correspondenceRating: '',
          selectedLichessRating: 'blitz'
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
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
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

            {/* Lichess Rating Selector */}
            {formData.lichessUsername && (
              <div>
                <label className="block text-sm font-medium mb-1">Use Lichess Rating As Primary</label>
                <select
                  value={formData.selectedLichessRating}
                  onChange={(e) => setFormData({...formData, selectedLichessRating: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="bullet">Bullet ({formData.bulletRating || 'Not rated'})</option>
                  <option value="blitz">Blitz ({formData.blitzRating || 'Not rated'})</option>
                  <option value="rapid">Rapid ({formData.rapidRating || 'Not rated'})</option>
                  <option value="classical">Classical ({formData.classicalRating || 'Not rated'})</option>
                  <option value="correspondence">Correspondence ({formData.correspondenceRating || 'Not rated'})</option>
                </select>
              </div>
            )}

            {/* Lichess Ratings Display */}
            {(formData.bulletRating || formData.blitzRating || formData.rapidRating || formData.classicalRating) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Lichess Ratings</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.bulletRating && <div>Bullet: {formData.bulletRating}</div>}
                  {formData.blitzRating && <div>Blitz: {formData.blitzRating}</div>}
                  {formData.rapidRating && <div>Rapid: {formData.rapidRating}</div>}
                  {formData.classicalRating && <div>Classical: {formData.classicalRating}</div>}
                  {formData.correspondenceRating && <div>Correspondence: {formData.correspondenceRating}</div>}
                </div>
              </div>
            )}

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

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Import Players from CSV</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setCsvFile(null)
                    setImportPreview([])
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {!csvFile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Your CSV should have a header row with these column names (case-insensitive):
                    </p>
                    <div className="text-sm font-mono bg-white p-2 rounded border">
                      firstName,lastName,email,rating,ratingType,title,federation,lichessUsername
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Only firstName and lastName are required. Other fields are optional.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">File: {csvFile.name}</span>
                    <span className="text-sm text-gray-600">{importPreview.length} players found</span>
                  </div>

                  {importPreview.length > 0 && (
                    <div className="border rounded max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">First Name</th>
                            <th className="px-3 py-2 text-left">Last Name</th>
                            <th className="px-3 py-2 text-left">Email</th>
                            <th className="px-3 py-2 text-left">Rating</th>
                            <th className="px-3 py-2 text-left">Lichess</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0, 5).map((player, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">{player.firstname || player.first_name || player.first || ''}</td>
                              <td className="px-3 py-2">{player.lastname || player.last_name || player.last || ''}</td>
                              <td className="px-3 py-2">{player.email || ''}</td>
                              <td className="px-3 py-2">{player.rating || ''}</td>
                              <td className="px-3 py-2">{player.lichessusername || player.lichess_username || player.lichess || ''}</td>
                            </tr>
                          ))}
                          {importPreview.length > 5 && (
                            <tr>
                              <td colSpan={5} className="px-3 py-2 text-center text-gray-500">
                                ... and {importPreview.length - 5} more players
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={importPlayers}
                      disabled={importing || !importPreview.length}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {importing ? 'Importing...' : `Import ${importPreview.length} Players`}
                    </button>
                    <button
                      onClick={() => {
                        setCsvFile(null)
                        setImportPreview([])
                      }}
                      className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                    >
                      Choose Different File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}