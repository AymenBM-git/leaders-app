import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const payment = await prisma.payment.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            student: true
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
            amount: Number(json.amount),
            as: json.as,
            type: json.type,
            studentId: Number(json.studentId)||null,
        }
    })

    // 1. Log Activity
                const cookiesStore = cookies();
                const nameuser= String((await cookiesStore).get('user-name')?.value);
                await prisma.activity.create({
                    data: {
                        nameUser: nameuser,
                        description: `a modifié un payment de ${payment.amount} DT pour l'année scolaire ${payment.as}.`,
                    }
                });
                
    return NextResponse.json(payment)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const payment = await prisma.payment.delete({
        where: {
            id: Number(params.id)
        }
    })

    // 1. Log Activity
            const cookiesStore = cookies();
            const nameuser= String((await cookiesStore).get('user-name')?.value);
            await prisma.activity.create({
                data: {
                    nameUser: nameuser,
                    description: `a supprimé un payment de ${payment.amount} DT pour l'année scolaire ${payment.as}.`,
                }
            });
    return NextResponse.json(payment)
}
