import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: rounds, error } = await supabase
      .from('rounds')
      .select(`
        *,
        matches:matches(count)
      `)
      .eq('tournament_id', params.id)
      .order('number', { ascending: true })

    if (error) {
      console.error('Failed to fetch rounds:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(rounds)
  } catch (error) {
    console.error('Failed to fetch rounds:', error)
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
    const supabase = createServerSupabaseClient()

    // Get tournament info
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        *,
        players (*)
      `)
      .eq('id', params.id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    if (tournament.status !== 'ONGOING') {
      return NextResponse.json({ error: 'Tournament must be ongoing to start rounds' }, { status: 400 })
    }

    // Calculate next round number
    const { data: lastRound } = await supabase
      .from('rounds')
      .select('number')
      .eq('tournament_id', params.id)
      .order('number', { ascending: false })
      .limit(1)
      .single()

    const nextRoundNumber = (lastRound?.number || 0) + 1

    // Create new round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        tournament_id: params.id,
        number: nextRoundNumber,
        start_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (roundError) {
      console.error('Failed to create round:', roundError)
      return NextResponse.json({ error: 'Failed to create round' }, { status: 500 })
    }

    // Generate pairings using Swiss system
    await generatePairings(supabase, params.id, nextRoundNumber, tournament.players, round.id)

    return NextResponse.json(round)
  } catch (error) {
    console.error('Failed to create round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generatePairings(supabase: any, tournamentId: string, roundNumber: number, players: any[], roundId: string) {
  // Simple pairing logic - in a real system, this would use proper Swiss pairing algorithm
  const activePlayers = players.filter((p: any) => p.is_active)
  const pairedPlayers = []
  const usedPlayers = new Set()

  // Sort by score descending
  activePlayers.sort((a: any, b: any) => b.score - a.score)

  for (let i = 0; i < activePlayers.length - 1; i += 2) {
    const player1 = activePlayers[i]
    const player2 = activePlayers[i + 1]

    if (player1 && player2 && !usedPlayers.has(player1.id) && !usedPlayers.has(player2.id)) {
      // Create match
      await supabase.from('matches').insert({
        tournament_id: tournamentId,
        round_id: roundId,
        board_number: Math.floor(i / 2) + 1,
        white_player_id: player1.id,
        black_player_id: player2.id,
      })

      usedPlayers.add(player1.id)
      usedPlayers.add(player2.id)
      pairedPlayers.push(player1, player2)
    }
  }

  // Handle odd number of players - give bye
  const unpairedPlayers = activePlayers.filter((p: any) => !usedPlayers.has(p.id))
  if (unpairedPlayers.length === 1) {
    const byePlayer = unpairedPlayers[0]
    await supabase.from('byes').insert({
      tournament_id: tournamentId,
      player_id: byePlayer.id,
      round_number: roundNumber,
      is_approved: true,
    })

    // Award bye points - get current score and update
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('score')
      .eq('id', byePlayer.id)
      .single()

    if (currentPlayer) {
      await supabase
        .from('players')
        .update({ score: (currentPlayer.score || 0) + 1 })
        .eq('id', byePlayer.id)
    }
  }
}