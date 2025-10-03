import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            players: true,
            matches: true,
          },
        },
        players: {
          orderBy: { score: 'desc' },
        },
        matches: true,
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
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
        status: body.status,
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Failed to update tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tournament.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}