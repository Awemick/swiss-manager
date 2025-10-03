import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const response = await fetch(`https://lichess.org/api/user/${params.username}`, {
      headers: {
        'User-Agent': 'ChessTournamentManager/1.0'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found on Lichess' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch from Lichess' }, { status: response.status })
    }

    const data = await response.json()

    const ratings = {
      blitz: data.perfs?.blitz?.rating || null,
      rapid: data.perfs?.rapid?.rating || null,
      classical: data.perfs?.classical?.rating || null
    }

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Failed to fetch Lichess ratings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}