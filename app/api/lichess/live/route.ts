import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'tournaments' // tournaments, games, arenas
    const limit = parseInt(searchParams.get('limit') || '10')

    let endpoint = ''
    let params = ''

    switch (type) {
      case 'tournaments':
        endpoint = 'https://lichess.org/api/tournament'
        break
      case 'arenas':
        endpoint = 'https://lichess.org/api/tournament/created'
        params = `?max=${limit}`
        break
      case 'games':
        // For live games, we'd need a different approach
        // Lichess doesn't have a simple live games API
        return NextResponse.json({
          error: 'Live games feed not available through Lichess API',
          suggestion: 'Use tournament or arena feeds instead'
        }, { status: 400 })
      default:
        return NextResponse.json({ error: 'Invalid type. Use: tournaments, arenas' }, { status: 400 })
    }

    const response = await fetch(`${endpoint}${params}`, {
      headers: {
        'User-Agent': 'ChessTournamentManager/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch live data' }, { status: response.status })
    }

    const data = await response.json()

    // Process the data based on type
    let processedData = []

    if (type === 'tournaments') {
      processedData = data.created?.slice(0, limit).map(tournament => ({
        id: tournament.id,
        name: tournament.fullName,
        status: tournament.status,
        startsAt: tournament.startsAt,
        players: tournament.nbPlayers,
        variant: tournament.variant,
        timeControl: tournament.clock,
        rated: tournament.rated,
        berserkable: tournament.berserkable,
        description: tournament.description
      })) || []
    } else if (type === 'arenas') {
      processedData = data.slice(0, limit).map(arena => ({
        id: arena.id,
        name: arena.fullName,
        status: arena.status,
        startsAt: arena.startsAt,
        players: arena.nbPlayers,
        variant: arena.variant,
        timeControl: arena.clock,
        rated: arena.rated,
        berserkable: arena.berserkable
      }))
    }

    return NextResponse.json({
      type,
      data: processedData,
      total: processedData.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch Lichess live data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}