import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { isParentActive } from '../../../../../../lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const parentId = request.headers.get('X-Parent-Id');

        if (!studentId) {
            return NextResponse.json({ error: "studentId is required" }, { status: 400 });
        }

        console.log(`[Filters API] Fetching filters for studentId: ${studentId}`);

        // Verify parent is active if parentId is provided
        if (parentId) {
            const isActive = await isParentActive(parentId);
            if (!isActive) {
                console.log(`[Filters API] Parent ${parentId} is not active`);
                return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
            }
        }

        // Get student's class
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            select: { classId: true, firstName: true }
        });

        if (!student) {
            console.log(`[Filters API] Student ${studentId} not found`);
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        console.log(`[Filters API] Student ${student.firstName} found in class ${student.classId}`);

        if (!student.classId) {
            console.log(`[Filters API] Student ${studentId} has no class assigned`);
            return NextResponse.json({ error: "Student has no class assigned" }, { status: 400 });
        }

        // Get subjects from schedule for this class
        const schedules = await prisma.schedule.findMany({
            where: { classId: student.classId },
            include: {
                subject: {
                    select: { id: true, name: true }
                }
            },
            distinct: ['subjectId']
        });

        let subjects = schedules
            .map(s => s.subject)
            .filter((s): s is { id: number; name: string } => s !== null && s.name !== null);

        console.log(`[Filters API] Found ${subjects.length} subjects from schedules`);

        // fallback to NoteDevoir if schedules are empty
        if (subjects.length === 0) {
            const notes = await prisma.noteDevoir.findMany({
                where: { classId: student.classId },
                include: { subject: { select: { id: true, name: true } } },
                distinct: ['subjectId']
            });
            subjects = notes
                .map(n => n.subject)
                .filter((s): s is { id: number; name: string } => s !== null && s.name !== null);
            console.log(`[Filters API] Found ${subjects.length} subjects from existing notes`);
        }

        // Final fallback: all subjects
        if (subjects.length === 0) {
            const allSubjects = await prisma.subject.findMany({
                select: { id: true, name: true },
                take: 50 // Limit to avoid long list
            });
            subjects = allSubjects.filter((s): s is { id: number; name: string } => s.name !== null);
            console.log(`[Filters API] Falling back to all subjects (found ${subjects.length})`);
        }

        console.log(`[Filters API] Final subjects identified: ${subjects.map(s => s.name).join(', ')}`);

        // Standard periods
        const periods = ['الثلاثي الأول', 'الثلاثي الثاني', 'الثلاثي الثالث'];

        // Current AS
        const now = new Date();
        const year = now.getFullYear();
        const currentAS = now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

        return NextResponse.json({
            subjects,
            periods,
            currentAS
        });
    } catch (error) {
        console.error("Fetch mobile notes filters error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
