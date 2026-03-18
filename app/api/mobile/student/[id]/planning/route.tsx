import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { isParentActive } from '../../../../../../lib/mobile-auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');

        if (parentId) {
            const isActive = await isParentActive(parentId);
            if (!isActive) {
                return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
            }
        }

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
                classId: studentClassId,
                datePlaning: {
                    lte: new Date()
                }
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
                },
                sessionEvaluations: {
                    where: {
                        studentId: Number(params.id)
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
