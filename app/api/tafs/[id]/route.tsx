import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const payment = await prisma.taf.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            subject: true,
            class: true
        }
    })
    return NextResponse.json(payment)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const taf = await prisma.taf.update({
        where: {
            id: Number(params.id)
        },
        data: {
            dateTaf: new Date(json.dateTaf),
            type: json.type,
            subjectId: json.subjectId? Number(json.subjectId) : null,
            description: json.description,
            classId: json.classId? Number(json.classId) : null,
        }
    })

    // 1. Log Activity
    const cookiesStore = cookies();
    const nameuser= String((await cookiesStore).get('user-name')?.value);
    await prisma.activity.create({
        data: {
            nameUser: nameuser,
            description: `a modifié le TAF/Devoir: ${taf.description}.`,
        }
    });
            
    return NextResponse.json(taf)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const taf = await prisma.taf.delete({
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
            description: `a supprimé le TAF/Devoir: ${taf.description}.`,
        }
    });
    return NextResponse.json(taf)
}
