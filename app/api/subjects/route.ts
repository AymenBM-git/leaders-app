import { cookies } from 'next/headers';
import  prisma  from '../../../lib/prisma';
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

    // 1. Log Activity
        const cookiesStore = cookies();
        const nameuser= String((await cookiesStore).get('user-name')?.value);
        await prisma.activity.create({
            data: {
                nameUser: nameuser,
                description: `a créé la matière ${subject.name}.`,
            }
        });

    return NextResponse.json(subject)
}
