import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const status = searchParams.get('status') || 'finished' // created, started, finished

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 })
    }

    // Fetch user's tournament history
    const response = await fetch(`https://lichess.org/api/user/${username}/tournament/history?status=${status}`, {
      headers: {
        'User-Agent': 'ChessTournamentManager/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: response.status })
    }

    const tournaments = await response.json()

    // Process and format tournament data
    const processedTournaments = tournaments.map(tournament => ({
      id: tournament.tournament.id,
      name: tournament.tournament.name,
      status: tournament.tournament.status,
      startsAt: tournament.tournament.startsAt,
      finishesAt: tournament.tournament.finishesAt,
      rank: tournament.rank,
      score: tournament.score,
      performance: tournament.performance,
      players: tournament.tournament.nbPlayers,
      variant: tournament.tournament.variant,
      timeControl: tournament.tournament.clock,
      position: tournament.rank,
      totalParticipants: tournament.tournament.nbPlayers
    }))

    return NextResponse.json({
      username,
      tournaments: processedTournaments,
      total: processedTournaments.length
    })

  } catch (error) {
    console.error('Failed to fetch Lichess tournaments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}