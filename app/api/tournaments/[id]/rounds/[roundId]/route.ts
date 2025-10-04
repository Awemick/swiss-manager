import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })

    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', params.roundId)
      .single()

    if (roundError) {
      console.error('Failed to fetch round:', roundError)
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Get matches with player data
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('round_id', params.roundId)
      .order('board_number', { ascending: true })

    if (matchesError) {
      console.error('Failed to fetch matches:', matchesError)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Get player data for all players in matches
    const playerIds = new Set()
    matchesData?.forEach(match => {
      if (match.white_player_id) playerIds.add(match.white_player_id)
      if (match.black_player_id) playerIds.add(match.black_player_id)
    })

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .in('id', Array.from(playerIds))

    if (playersError) {
      console.error('Failed to fetch players:', playersError)
    }

    // Combine matches with player data
    const matches = matchesData?.map(match => ({
      ...match,
      whitePlayer: players?.find(p => p.id === match.white_player_id),
      blackPlayer: players?.find(p => p.id === match.black_player_id)
    })) || []

    if (matchesError) {
      console.error('Failed to fetch matches:', matchesError)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Fetch byes for this round
    const { data: byes, error: byesError } = await supabase
      .from('byes')
      .select(`
        *,
        player:players(*)
      `)
      .eq('tournament_id', params.id)
      .eq('round_number', round.number)

    if (byesError) {
      console.error('Failed to fetch byes:', byesError)
    }

    return NextResponse.json({ round, matches: matches || [], byes: byes || [] })
  } catch (error) {
    console.error('Failed to fetch round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}