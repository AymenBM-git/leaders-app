import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const planings = await prisma.planing.findMany({
            include: {
                teacher: true,
                ressouces: true,
            },
            orderBy: {
                datePlaning: 'asc'
            }
        });
        return NextResponse.json(planings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch planings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { teacherId, as, type, datePlaning, description, name, classId } = data;

        const planing = await prisma.planing.create({
            data: {
                teacherId: teacherId ? parseInt(teacherId) : null,
                as,
                type,
                datePlaning: datePlaning ? new Date(datePlaning) : null,
                description,
                name,
                classId: classId ? parseInt(classId) : null,
            },
            include: {
                teacher: true,
            }
        });

        // Log Activity
        const cookiesStore = cookies();
        const nameuser = (await cookiesStore).get('user-name')?.value;
        await prisma.activity.create({
            data: {
                nameUser: nameuser || 'System',
                description: `a créé une répartition pour: ${planing.teacher?.name || 'Inconnu'}.`,
            }
        });

        return NextResponse.json(planing);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create planing' }, { status: 500 });
    }
}
