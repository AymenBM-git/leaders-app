import { cookies } from 'next/headers';
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
    // 1. Log Activity
    const cookiesStore = cookies();
    const nameuser= String((await cookiesStore).get('user-name')?.value);
    await prisma.activity.create({
        data: {
            nameUser: nameuser,
            description: `a créé une salle ${room.name}.`,
        }
    });
    return NextResponse.json(room)
}
