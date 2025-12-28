import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const room = await prisma.room.findUnique({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(room)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const room = await prisma.room.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name: json.name,
            type: json.type,
            capacity: json.capacity ? Number(json.capacity) : null,
            status: json.status,
        }
    })
    return NextResponse.json(room)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const room = await prisma.room.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(room)
}
