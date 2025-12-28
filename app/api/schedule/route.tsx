import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const schedule = await prisma.schedule.findMany({
        include: {
            room: true,
            class: true,
            teacher: true,
            subject: true
        }
    })
    return NextResponse.json(schedule)
}

export async function POST(request: Request) {
    const json = await request.json()
    const schedule = await prisma.schedule.create({
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
    return NextResponse.json(schedule)
}
