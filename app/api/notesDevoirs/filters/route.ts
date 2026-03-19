import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const role = cookieStore.get('user-role')?.value;
        const userId = cookieStore.get('user-id')?.value;

        let classes: any[] = [];
        let subjects: any[] = [];

        if (role === 'prof' && userId) {
            const teacherId = parseInt(userId);
            const teacher = await prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    classes: {
                        select: { id: true, name: true, level: true },
                        orderBy: { name: 'asc' }
                    },
                    subject: {
                        select: { id: true, name: true }
                    }
                }
            });

            if (teacher) {
                classes = teacher.classes;
                subjects = teacher.subject ? [teacher.subject] : [];
            }
        } else {
            // Admin or other: fetch everything
            [classes, subjects] = await Promise.all([
                prisma.class.findMany({
                    select: { id: true, name: true, level: true },
                    orderBy: { name: 'asc' }
                }),
                prisma.subject.findMany({
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' }
                })
            ]);
        }

        return NextResponse.json({
            classes: classes.map(c => ({ id: c.id, name: c.name, level: c.level })),
            subjects: subjects.map(s => ({ id: s.id, name: s.name })),
            periods: ['Trimestre1', 'Trimestre2', 'Trimestre3'],
            examTypes: ['DC1', 'DC2', 'TP', 'Orale', 'DS'],
            academicYears: await getAcademicYears()
        });
    } catch (error: any) {
        console.error("Error fetching notesDevoirs filters:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

async function getAcademicYears() {
    // Get unique academic years from NoteDevoir or current calculation
    const years = await prisma.noteDevoir.findMany({
        select: { as: true },
        distinct: ['as'],
        where: { as: { not: null } }
    });
    
    const yearList = years.map(y => y.as as string);
    
    // Always include current AS
    const now = new Date();
    const year = now.getFullYear();
    const currentAS = now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    
    if (!yearList.includes(currentAS)) {
        yearList.push(currentAS);
    }
    
    return yearList.sort().reverse();
}
