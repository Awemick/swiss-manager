import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const players = await prisma.player.findMany({
      where: { tournamentId: params.id },
      orderBy: [{ score: 'desc' }, { rating: 'desc' }],
    })

    return NextResponse.json({ players })
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
    const body = await request.json()
    
    const player = await prisma.player.create({
      data: {
        tournamentId: params.id,
        firstName: body.firstName,
        lastName: body.lastName,
        rating: body.rating,
        ratingType: body.ratingType,
        title: body.title,
        federation: body.federation,
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Failed to create player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}