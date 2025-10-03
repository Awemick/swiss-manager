import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string; matchId: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const body = await request.json()

    const { data, error } = await supabase
      .from('matches')
      .update({
        result: body.result,
        end_time: new Date().toISOString(),
      })
      .eq('id', params.matchId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}