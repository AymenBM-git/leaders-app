import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const today = new Date().setHours(0, 0, 0, 0)
    const events = await prisma.event.findMany({
        where: {
            dateEvent: { gte: new Date(today) }
        },
        orderBy: {
            dateEvent: 'asc'
        },
        take: 1
    })
    return NextResponse.json(events)
}