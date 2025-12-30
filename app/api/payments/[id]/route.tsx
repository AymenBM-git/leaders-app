import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const payment = await prisma.payment.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            parent: true
        }
    })
    return NextResponse.json(payment)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const payment = await prisma.payment.update({
        where: {
            id: Number(params.id)
        },
        data: {
            amount: json.amount,
            as: json.as,
            type: json.type,
            parentId: json.parentId
        }
    })
    return NextResponse.json(payment)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const payment = await prisma.payment.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(payment)
}
