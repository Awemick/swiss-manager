import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
const { Chess } = require('chess.js')

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('pgn') as File

    if (!file) {
      return NextResponse.json({ error: 'No PGN file provided' }, { status: 400 })
    }

    const pgnText = await file.text()

    // Parse PGN
    const chess = new Chess()
    const loadResult = chess.loadPgn(pgnText)

    if (!loadResult) {
      return NextResponse.json({ error: 'Invalid PGN format' }, { status: 400 })
    }

    const moves = chess.history()
    const result = chess.header()['Result'] || null
    const num_moves = moves.length

    // For now, skip opening and ECO
    const opening = null
    const eco_code = null

    // Update match
    const { error } = await supabase
      .from('matches')
      .update({
        moves: pgnText,
        result: result === '1-0' ? 'WHITE_WIN' : result === '0-1' ? 'BLACK_WIN' : result === '1/2-1/2' ? 'DRAW' : null,
        opening,
        eco_code,
        num_moves
      })
      .eq('id', params.matchId)

    if (error) {
      console.error('Failed to update match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process PGN:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}