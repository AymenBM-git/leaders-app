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
        const classId = searchParams.get('classId');

        const planings = await prisma.planing.findMany({
            where: {
                teacherId,
                ...(as ? { as } : {}),
                ...(classId ? { classId: parseInt(classId) } : {})
            },
            include: {
                teacher: true,
                ressouces: true,
                sessionEvaluations: true
            },
            orderBy: {
                datePlaning: 'asc'
            }
        });

        const planingsWithAverage = planings.map(planing => {
            let average = null;
            if (planing.sessionEvaluations && planing.sessionEvaluations.length > 0) {
                const sum = planing.sessionEvaluations.reduce((acc, curr) => acc + curr.note, 0);
                average = sum / planing.sessionEvaluations.length;
            }
            return {
                ...planing,
                averageNote: average,
                evalCount: planing.sessionEvaluations.length
            };
        });

        return NextResponse.json(planingsWithAverage);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch planings for teacher' }, { status: 500 });
    }
}
