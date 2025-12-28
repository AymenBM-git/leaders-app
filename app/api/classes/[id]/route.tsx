import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const classItem = await prisma.class.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            teachers: true,
            students: true,
            schedules: true
        }
    })
    return NextResponse.json(classItem)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const updatedClass = await prisma.class.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name: json.name,
            level: json.level,
            //teacherId: json.teacherId ? Number(json.teacherId) : null,
        }
    })
    return NextResponse.json(updatedClass)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const deletedClass = await prisma.class.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(deletedClass)
}
