import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const response = await fetch(`https://lichess.org/api/game/${params.gameId}`, {
      headers: {
        'User-Agent': 'ChessTournamentManager/1.0'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch from Lichess' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Lichess game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}