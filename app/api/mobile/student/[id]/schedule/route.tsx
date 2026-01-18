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
            select: { classId: true }
        });

        if (!student || !student.classId) {
            return NextResponse.json({ error: "Student or class not found" }, { status: 404 });
        }

        const schedules = await prisma.schedule.findMany({
            where: { classId: student.classId },
            include: {
                subject: true,
                room: true,
                teacher: true
            }
        });

        return NextResponse.json(schedules);
    } catch (error) {
        console.error("Fetch schedule error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
