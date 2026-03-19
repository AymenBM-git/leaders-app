import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isParentActive } from '../../../../../lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const subjectId = searchParams.get('subjectId');
        const period = searchParams.get('period');
        const as = searchParams.get('as');
        const parentId = request.headers.get('X-Parent-Id');

        if (!studentId) {
            return NextResponse.json({ error: "studentId is required" }, { status: 400 });
        }

        // Verify parent is active if parentId is provided
        if (parentId) {
            const isActive = await isParentActive(parentId);
            if (!isActive) {
                return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
            }
        }

        // Construct where clause
        const where: any = { studentId: Number(studentId) };
        if (subjectId) where.subjectId = Number(subjectId);
        if (period) where.libperiodexam = period;
        if (as) where.as = as;

        // Fetch notes for the student
        const notes = await prisma.noteDevoir.findMany({
            where,
            include: {
                subject: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Consolidate notes by subject
        const consolidated: Record<string, any> = {};
        
        notes.forEach(note => {
            const subjectName = note.subject?.name || "Autre";
            if (!consolidated[subjectName]) {
                consolidated[subjectName] = [];
            }
            consolidated[subjectName].push({
                id: note.id,
                type: note.libTypeEpr,
                period: note.libperiodexam,
                note: note.noteepre,
                isAbsent: note.isAbsent,
                date: note.createdAt,
                as: note.as
            });
        });

        return NextResponse.json(consolidated);
    } catch (error) {
        console.error("Fetch mobile notes error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
