import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase.from('tournaments').insert({
      name: body.name,
      description: body.description,
      type: body.type || 'SWISS',
      rounds: body.rounds || 5,
      time_control: body.timeControl,
      start_date: body.startDate,
      end_date: body.endDate,
      location: body.location,
      director: body.director,
      points_win: body.pointsWin || 1.0,
      points_draw: body.pointsDraw || 0.5,
      points_loss: body.pointsLoss || 0.0,
      tiebreak1: body.tiebreak1 || 'BUCHHOLZ',
      tiebreak2: body.tiebreak2 || 'SONNEBORN_BERGER',
      allow_half_points: body.allowHalfPoints ?? true,
      auto_pairing: body.autoPairing ?? true,
      status: 'SCHEDULED',
      organizer_id: user.id,
    }).select().single()

    if (error) {
      console.error('Failed to create tournament:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: tournaments, error, count } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Failed to fetch tournaments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      tournaments,
      totalCount: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Failed to fetch tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}