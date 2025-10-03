import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rounds = await prisma.round.findMany({
      where: { tournamentId: params.id },
      include: {
        _count: {
          select: {
            matches: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    })

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
    // Get tournament info
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: { players: { orderBy: { score: 'desc' } } }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.status !== 'ONGOING') {
      return NextResponse.json(
        { error: 'Tournament must be ongoing to start rounds' },
        { status: 400 }
      )
    }

    // Calculate next round number
    const lastRound = await prisma.round.findFirst({
      where: { tournamentId: params.id },
      orderBy: { number: 'desc' }
    })

    const nextRoundNumber = (lastRound?.number || 0) + 1

    // Create new round
    const round = await prisma.round.create({
      data: {
        tournamentId: params.id,
        number: nextRoundNumber,
        startTime: new Date(),
      },
    })

    // Generate pairings using Swiss system
    await generatePairings(tournament.id, nextRoundNumber, tournament.players)

    return NextResponse.json(round)
  } catch (error) {
    console.error('Failed to create round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generatePairings(tournamentId: string, roundNumber: number, players: any[]) {
  // Simple pairing logic - in a real system, this would use proper Swiss pairing algorithm
  const activePlayers = players.filter(p => p.isActive)
  const pairedPlayers = []
  const usedPlayers = new Set()

  // Sort by score descending
  activePlayers.sort((a, b) => b.score - a.score)

  for (let i = 0; i < activePlayers.length - 1; i += 2) {
    const player1 = activePlayers[i]
    const player2 = activePlayers[i + 1]

    if (player1 && player2 && !usedPlayers.has(player1.id) && !usedPlayers.has(player2.id)) {
      // Create match
      await prisma.match.create({
        data: {
          tournamentId,
          roundId: (await prisma.round.findFirst({
            where: { tournamentId, number: roundNumber }
          }))!.id,
          boardNumber: Math.floor(i / 2) + 1,
          whitePlayerId: player1.id,
          blackPlayerId: player2.id,
        }
      })

      usedPlayers.add(player1.id)
      usedPlayers.add(player2.id)
      pairedPlayers.push(player1, player2)
    }
  }

  // Handle odd number of players - give bye
  const unpairedPlayers = activePlayers.filter(p => !usedPlayers.has(p.id))
  if (unpairedPlayers.length === 1) {
    const byePlayer = unpairedPlayers[0]
    await prisma.bye.create({
      data: {
        tournamentId,
        playerId: byePlayer.id,
        roundNumber,
        isApproved: true,
      }
    })

    // Award bye points
    await prisma.player.update({
      where: { id: byePlayer.id },
      data: {
        score: { increment: 1 }, // Assuming 1 point for bye
      }
    })
  }
}