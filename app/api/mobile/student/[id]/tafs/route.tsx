import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const student = await prisma.student.findUnique({
            where: { id: Number(params.id) },
            select: { classId: true }
        });

        if (!student || !student.classId) {
            return NextResponse.json({ error: "Student or class not found" }, { status: 404 });
        }

        const tafs = await prisma.taf.findMany({
            where: { classId: student.classId },
            include: {
                subject: true
            },
            orderBy: { dateTaf: 'desc' }
        });

        return NextResponse.json(tafs);
    } catch (error) {
        console.error("Fetch tafs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
