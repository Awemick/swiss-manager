import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    // Mark round as completed
    const round = await prisma.round.update({
      where: { id: params.roundId },
      data: {
        isCompleted: true,
        endTime: new Date(),
      },
      include: {
        matches: {
          include: {
            whitePlayer: true,
            blackPlayer: true,
          }
        }
      }
    })

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

        // Update white player score
        await prisma.player.update({
          where: { id: match.whitePlayerId },
          data: {
            score: { increment: whiteScore }
          }
        })

        // Update black player score
        await prisma.player.update({
          where: { id: match.blackPlayerId },
          data: {
            score: { increment: blackScore }
          }
        })
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