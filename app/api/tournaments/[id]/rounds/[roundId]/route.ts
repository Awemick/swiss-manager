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

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        whitePlayer:players!white_player_id(*),
        blackPlayer:players!black_player_id(*)
      `)
      .eq('round_id', params.roundId)
      .order('board_number', { ascending: true })

    if (matchesError) {
      console.error('Failed to fetch matches:', matchesError)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    return NextResponse.json({ round, matches })
  } catch (error) {
    console.error('Failed to fetch round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}