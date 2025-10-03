import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('tournament_id', params.id)
      .order('score', { ascending: false })

    if (error) {
      console.error('Failed to fetch players:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()

    const { data, error } = await supabase.from('players').insert({
      tournament_id: params.id,
      user_id: user?.id,
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      rating: body.rating,
      rating_type: body.ratingType || 'FIDE',
      title: body.title,
      federation: body.federation,
      lichess_username: body.lichessUsername,
      blitz_rating: body.blitzRating,
      rapid_rating: body.rapidRating,
      classical_rating: body.classicalRating,
    }).select().single()

    if (error) {
      console.error('Failed to create player:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}