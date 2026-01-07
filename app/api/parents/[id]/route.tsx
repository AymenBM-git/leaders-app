import { cookies } from 'next/headers';
import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs';

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
    const hashedPassword = json.password ? await bcrypt.hash(json.password, 10) : null
    const parent = await prisma.parent.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name1: json.name1,
            relation1: json.relation1,
            email1: json.email1,
            phone1: json.phone1,
            name2: json.name2,
            relation2: json.relation2,
            email2: json.email2,
            phone2: json.phone2,
            username: json.username,
            password: hashedPassword
        }
    })

    // 1. Log Activity
        const cookiesStore = cookies();
        const nameuser= String((await cookiesStore).get('user-name')?.value);
        await prisma.activity.create({
            data: {
                nameUser: nameuser,
                description: `a modifié le parent ${parent.name1}`,
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
                description: `a supprimé le parent ${parent.name1}`,
            }
        });

    return NextResponse.json(parent)
}
