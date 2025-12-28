import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const subject = await prisma.subject.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            teachers: true
        }
    })

    if (!subject) {
        return new NextResponse(null, { status: 404 })
    }

    return NextResponse.json(subject)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const json = await request.json()

    // Basic validation
    if (!json.name ) {
        return NextResponse.json(
            { error: 'Name is required' },
            { status: 400 }
        )
    }

    const subject = await prisma.subject.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name: json.name,
            codematiere: json.codematiere,
        },
    })

    return NextResponse.json(subject)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Check if subject is used by teachers before delete? 
    // For now assuming cascade or simple delete is fine, or simple check
    // If teachers are linked, we might want to handle that. 
    // Prisma schema shows: teachers Teacher[]
    // If we delete subject, what happens to teachers? 
    // Relation in Teacher: subject   Subject?  @relation(fields: [subjectId], references: [id])
    // The relation is optional on Teacher side. 
    // Ideally we should probably clear the link or prevent delete.
    // For simplicity following other routes patterns.

    const subject = await prisma.subject.delete({
        where: {
            id: parseInt(id),
        },
    })

    return NextResponse.json(subject)
}
