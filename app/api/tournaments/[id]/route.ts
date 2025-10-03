import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        players:players(count),
        matches:matches(count),
        players_list:players(*)
      `)
      .eq('id', params.id)
      .single()

    if (error || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get matches separately
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', params.id)

    return NextResponse.json({
      ...tournament,
      players: tournament.players_list,
      matches: matches || [],
      _count: {
        players: tournament.players || 0,
        matches: tournament.matches || 0,
      }
    })
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('tournaments')
      .update({
        name: body.name,
        description: body.description,
        type: body.type,
        rounds: body.rounds,
        time_control: body.timeControl,
        start_date: body.startDate,
        end_date: body.endDate,
        location: body.location,
        director: body.director,
        points_win: body.pointsWin,
        points_draw: body.pointsDraw,
        points_loss: body.pointsLoss,
        tiebreak1: body.tiebreak1,
        tiebreak2: body.tiebreak2,
        allow_half_points: body.allowHalfPoints,
        auto_pairing: body.autoPairing,
        status: body.status,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update tournament:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Failed to delete tournament:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}