import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies: () => cookies() })

    // Mark round as completed
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .update({
        is_completed: true,
        end_time: new Date().toISOString(),
      })
      .eq('id', params.roundId)
      .select(`
        *,
        matches (
          *,
          whitePlayer:players!white_player_id(*),
          blackPlayer:players!black_player_id(*)
        )
      `)
      .single()

    if (roundError) {
      console.error('Failed to update round:', roundError)
      return NextResponse.json({ error: 'Failed to complete round' }, { status: 500 })
    }

    // Update player scores based on match results
    for (const match of round.matches) {
      if (match.result) {
        let whiteScore = 0
        let blackScore = 0

        switch (match.result) {
          case 'WHITE_WIN':
            whiteScore = 1
            blackScore = 0
            break
          case 'BLACK_WIN':
            whiteScore = 0
            blackScore = 1
            break
          case 'DRAW':
            whiteScore = 0.5
            blackScore = 0.5
            break
        }

        // Get current scores
        const { data: whitePlayer } = await supabase
          .from('players')
          .select('score')
          .eq('id', match.white_player_id)
          .single()

        const { data: blackPlayer } = await supabase
          .from('players')
          .select('score')
          .eq('id', match.black_player_id)
          .single()

        // Update white player score
        if (whitePlayer) {
          await supabase
            .from('players')
            .update({ score: (whitePlayer.score || 0) + whiteScore })
            .eq('id', match.white_player_id)
        }

        // Update black player score
        if (blackPlayer) {
          await supabase
            .from('players')
            .update({ score: (blackPlayer.score || 0) + blackScore })
            .eq('id', match.black_player_id)
        }
      }
    }

    return NextResponse.json({ success: true, round })
  } catch (error) {
    console.error('Failed to complete round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}