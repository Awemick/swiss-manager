import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; roundId: string; matchId: string } }
) {
  try {
    const body = await request.json()

    const match = await prisma.match.update({
      where: { id: params.matchId },
      data: {
        result: body.result,
        endTime: new Date(),
      },
    })

    return NextResponse.json(match)
  } catch (error) {
    console.error('Failed to update match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}