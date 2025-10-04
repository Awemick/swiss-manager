import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const max = parseInt(searchParams.get('max') || '10')

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 })
    }

    // Fetch user's arena results
    const response = await fetch(`https://lichess.org/api/user/${username}/arena/history?max=${max}`, {
      headers: {
        'User-Agent': 'ChessTournamentManager/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch arena data' }, { status: response.status })
    }

    const arenas = await response.json()

    // Process and format arena data
    const processedArenas = arenas.map(arena => ({
      id: arena.tournament.id,
      name: arena.tournament.name,
      startsAt: arena.tournament.startsAt,
      rank: arena.rank,
      score: arena.score,
      performance: arena.performance,
      players: arena.tournament.nbPlayers,
      variant: arena.tournament.variant,
      timeControl: arena.tournament.clock,
      position: arena.rank,
      totalParticipants: arena.tournament.nbPlayers,
      standing: arena.standing || null
    }))

    return NextResponse.json({
      username,
      arenas: processedArenas,
      total: processedArenas.length
    })

  } catch (error) {
    console.error('Failed to fetch Lichess arenas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}