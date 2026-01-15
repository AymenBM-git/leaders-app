import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const absences = await prisma.absence.findMany({
            where: { studentId: Number(params.id) },
            include: {
                classe: true
            },
            orderBy: { dateAbsence: 'desc' }
        });

        return NextResponse.json(absences);
    } catch (error) {
        console.error("Fetch absences error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
