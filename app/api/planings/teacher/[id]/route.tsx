import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const teacherId = parseInt(id);
        const { searchParams } = new URL(request.url);
        const as = searchParams.get('as');
        const level = searchParams.get('level');

        const planings = await prisma.planing.findMany({
            where: {
                teacherId,
                ...(as ? { as } : {}),
                ...(level ? { level } : {})
            },
            include: {
                teacher: true,
                ressouces: true
            },
            orderBy: {
                datePlaning: 'asc'
            }
        });
        return NextResponse.json(planings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch planings for teacher' }, { status: 500 });
    }
}
