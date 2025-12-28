import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const classes = await prisma.class.findMany({
        include: {
            teachers: true,
            students: true,
            schedules: true
        }
    })
    return NextResponse.json(classes)
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const newClass = await prisma.class.create({
            data: {
                name: json.name,
                level: json.level
            }
        })
        return NextResponse.json(newClass)
    } catch (error) {
        console.error("Error creating class:", error)
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
    }
}
