import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const scheduleItem = await prisma.schedule.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            room: true,
            class: true,
            teacher: true,
            subject: true
        }
    })
    return NextResponse.json(scheduleItem)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const scheduleItem = await prisma.schedule.update({
        where: {
            id: Number(params.id)
        },
        data: {
            as: json.as,
            day: json.day,
            start: json.start,
            duration: json.duration ? Number(json.duration) : null,
            subjectId: json.subjectId ? Number(json.subjectId) : null,
            roomId: json.roomId ? Number(json.roomId) : null,
            classId: json.classId ? Number(json.classId) : null,
            teacherId: json.teacherId ? Number(json.teacherId) : null,
        }
    })
    return NextResponse.json(scheduleItem)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const scheduleItem = await prisma.schedule.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(scheduleItem)
}
