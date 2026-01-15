import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const student = await prisma.student.findUnique({
            where: { id: Number(params.id) },
            include: {
                classe: true
            }
        });

        if (!student || !student.classe) {
            return NextResponse.json({ error: "Student or class not found" }, { status: 404 });
        }

        const studentClassId = student.classe.id;
        const studentLevel = student.classe.level;

        const planings = await prisma.planing.findMany({
            where: {
                level: studentLevel
            },
            include: {
                teacher: {
                    include: {
                        subject: true
                    }
                },
                ressouces: {
                    where: {
                        OR: [
                            { classId: null },
                            { classId: studentClassId }
                        ]
                    }
                }
            },
            orderBy: { datePlaning: 'asc' }
        });

        return NextResponse.json(planings);
    } catch (error) {
        console.error("Fetch planning error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
