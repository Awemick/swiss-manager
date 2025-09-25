import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SwissPairing } from '@/lib/pairing/swiss'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        rounds: body.rounds,
        timeControl: body.timeControl,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location,
        director: body.director,
        pointsWin: body.pointsWin,
        pointsDraw: body.pointsDraw,
        pointsLoss: body.pointsLoss,
        tiebreak1: body.tiebreak1,
        tiebreak2: body.tiebreak2,
        allowHalfPoints: body.allowHalfPoints,
        autoPairing: body.autoPairing,
        status: 'REGISTRATION',
      },
    })

    return NextResponse.json(tournament)
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            players: true,
            matches: true,
          },
        },
        players: {
          take: 5,
          orderBy: { score: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    })

    const totalCount = await prisma.tournament.count()

    return NextResponse.json({
      tournaments,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error('Failed to fetch tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}