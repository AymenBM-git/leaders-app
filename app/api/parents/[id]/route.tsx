import { cookies } from 'next/headers';
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

    // 1. Log Activity
        const cookiesStore = cookies();
        const nameuser= String((await cookiesStore).get('user-name')?.value);
        await prisma.activity.create({
            data: {
                nameUser: nameuser,
                description: `a modifié le parent ${parent.name}`,
            }
        });
                
    return NextResponse.json(parent)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const parent = await prisma.parent.delete({
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
                description: `a supprimé le parent ${parent.name}`,
            }
        });

    return NextResponse.json(parent)
}
