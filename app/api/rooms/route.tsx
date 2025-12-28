import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const rooms = await prisma.room.findMany()
    return NextResponse.json(rooms)
}

export async function POST(request: Request) {
    const json = await request.json()
    const room = await prisma.room.create({
        data: {
            name: json.name,
            type: json.type,
            capacity: json.capacity ? Number(json.capacity) : null,
            status: json.status,
        }
    })
    return NextResponse.json(room)
}
