import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const activities = await prisma.activity.findMany({
        orderBy: {
            dateActivity: 'desc'
        },
        take: 3
    })
    return NextResponse.json(activities)
}

