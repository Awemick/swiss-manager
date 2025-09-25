'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User,
  Crown,
  Award
} from 'lucide-react'

interface Player {
  id: string
  firstName: string
  lastName: string
  rating: number
  ratingType: string
  title?: string
  federation?: string
  score: number
  isActive: boolean
}

export default function PlayersPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string
  
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [isAdding, setIsAdding] = useState(false)
  
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    rating: 0,
    ratingType: 'FIDE',
    title: '',
    federation: ''
  })

  useEffect(() => {
    fetchPlayers()
  }, [tournamentId])

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/players`)
      const data = await response.json()
      setPlayers(data.players)
    } catch (error) {
      console.error('Failed to fetch players:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPlayer = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      })

      if (response.ok) {
        setNewPlayer({
          firstName: '',
          lastName: '',
          rating: 0,
          ratingType: 'FIDE',
          title: '',
          federation: ''
        })
        setIsAdding(false)
        fetchPlayers() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to add player:', error)
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to remove this player?')) return
    
    try {
      await fetch(`/api/tournaments/${tournamentId}/players/${playerId}`, {
        method: 'DELETE'
      })
      fetchPlayers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete player:', error)
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === 'all' || 
                         (filterRating === '2400+' && player.rating >= 2400) ||
                         (filterRating === '2200-2399' && player.rating >= 2200 && player.rating < 2400) ||
                         (filterRating === '2000-2199' && player.rating >= 2000 && player.rating < 2200) ||
                         (filterRating === 'below2000' && player.rating < 2000)
    
    return matchesSearch && matchesRating
  })

  const getTitleBadge = (title?: string) => {
    if (!title) return null
    
    const titleColors = {
      'GM': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'IM': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'FM': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'CM': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'WGM': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    }
    
    return (
      <Badge className={`text-xs ${titleColors[title as keyof typeof titleColors] || 'bg-gray-100'}`}>
        {title}
      </Badge>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading players...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Player Management</h1>
          <p className="text-muted-foreground">
            Manage tournament players ({players.length} registered)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search players</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="rating-filter" className="sr-only">Filter by rating</Label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Rating Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="2400+">2400+ (GM Level)</SelectItem>
                  <SelectItem value="2200-2399">2200-2399 (IM Level)</SelectItem>
                  <SelectItem value="2000-2199">2000-2199 (Expert)</SelectItem>
                  <SelectItem value="below2000">Below 2000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Player Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Player</CardTitle>
            <CardDescription>Enter player details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newPlayer.firstName}
                  onChange={(e) => setNewPlayer({...newPlayer, firstName: e.target.value})}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newPlayer.lastName}
                  onChange={(e) => setNewPlayer({...newPlayer, lastName: e.target.value})}
                  placeholder="Last name"
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  value={newPlayer.rating}
                  onChange={(e) => setNewPlayer({...newPlayer, rating: parseInt(e.target.value) || 0})}
                  placeholder="Rating"
                />
              </div>
              <div>
                <Label htmlFor="ratingType">Rating Type</Label>
                <Select value={newPlayer.ratingType} onValueChange={(value) => setNewPlayer({...newPlayer, ratingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIDE">FIDE</SelectItem>
                    <SelectItem value="USCF">USCF</SelectItem>
                    <SelectItem value="ECF">ECF</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Select value={newPlayer.title} onValueChange={(value) => setNewPlayer({...newPlayer, title: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GM">Grandmaster (GM)</SelectItem>
                    <SelectItem value="IM">International Master (IM)</SelectItem>
                    <SelectItem value="FM">FIDE Master (FM)</SelectItem>
                    <SelectItem value="CM">Candidate Master (CM)</SelectItem>
                    <SelectItem value="WGM">Woman Grandmaster (WGM)</SelectItem>
                    <SelectItem value="WIM">Woman International Master (WIM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="federation">Federation</Label>
                <Input
                  id="federation"
                  value={newPlayer.federation}
                  onChange={(e) => setNewPlayer({...newPlayer, federation: e.target.value})}
                  placeholder="e.g., USA"
                  maxLength={3}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleAddPlayer} disabled={!newPlayer.firstName || !newPlayer.lastName}>
                Add Player
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Players ({filteredPlayers.length})</CardTitle>
          <CardDescription>
            {players.length} total players registered for this tournament
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Federation</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {player.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">{player.rating || '-'}</div>
                    <div className="text-xs text-muted-foreground">{player.ratingType}</div>
                  </TableCell>
                  <TableCell>{getTitleBadge(player.title)}</TableCell>
                  <TableCell>
                    {player.federation && (
                      <Badge variant="outline">{player.federation}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{player.score}</span>
                      {player.score > 0 && <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={player.isActive ? "default" : "secondary"}>
                      {player.isActive ? 'Active' : 'Withdrawn'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{players.length}</div>
            <div className="text-sm text-muted-foreground">Total Players</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {players.filter(p => p.rating >= 2400).length}
            </div>
            <div className="text-sm text-muted-foreground">2400+ Rated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {players.filter(p => p.title).length}
            </div>
            <div className="text-sm text-muted-foreground">Titled Players</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {players.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}