import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const parent = await prisma.parent.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            childrenIds: true
        }
    })
    return NextResponse.json(parent)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const parent = await prisma.parent.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name: json.name,
            relation: json.relation,
            email: json.email,
            phone: json.phone
        }
    })
    return NextResponse.json(parent)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const parent = await prisma.parent.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(parent)
}
