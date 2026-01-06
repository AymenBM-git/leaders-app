import { cookies } from 'next/headers';
import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const event = await prisma.event.findUnique({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(event)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const event = await prisma.event.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name: json.name,
            target: Number(json.target),
            dateEvent: json.date ? new Date(json.dateEvent) : null,
            description: json.description,
        }
    })

    // 1. Log Activity
        const cookiesStore = cookies();
        const name= String((await cookiesStore).get('user-name')?.value);
        await prisma.activity.create({
            data: {
                nameUser: name,
                description: `a modifié l'événement ${event.name}`,
            }
        });
        
    return NextResponse.json(event)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const event = await prisma.event.delete({
        where: {
            id: Number(params.id)
        }
    })

    // 1. Log Activity
    const cookiesStore = cookies();
    const name= String((await cookiesStore).get('user-name')?.value);
    await prisma.activity.create({
        data: {
            nameUser: name,
            description: `a supprimé l'événement ${event.name}`,
        }
    });

    return NextResponse.json(event)
}
