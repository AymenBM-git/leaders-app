import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const subjects = await prisma.subject.findMany({
        include: {
            teachers: true
        }
    })
    return NextResponse.json(subjects)
}

export async function POST(request: Request) {
    const json = await request.json()

    // Basic validation
    if (!json.name ) {
        return NextResponse.json(
            { error: 'Name is required' },
            { status: 400 }
        )
    }

    const subject = await prisma.subject.create({
        data: {
            name: json.name,
            codematiere: json.codematiere,
        }
    })

    return NextResponse.json(subject)
}
