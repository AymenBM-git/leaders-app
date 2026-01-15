import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const as = searchParams.get('as');
        const iuense = searchParams.get('iuense');
        const codeclass = searchParams.get('codeclass');

        const where: any = {};
        if (as) where.as = as;
        if (iuense) where.iuense = iuense;
        if (codeclass) where.codeclass = codeclass;

        // Get unique Academic Years
        const academicYears = await prisma.note.findMany({
            select: { as: true },
            distinct: ['as'],
            where: { as: { not: null } },
            orderBy: { as: 'desc' }
        });

        // Get unique Teachers (iuense + libens)
        const teachers = await prisma.note.findMany({
            select: { iuense: true, libens: true },
            distinct: ['iuense'],
            where: { ...where, iuense: { not: null } },
            orderBy: { libens: 'asc' }
        });

        // Get unique Classes (codeclass + libeclass)
        const classes = await prisma.note.findMany({
            select: { codeclass: true, libeclass: true },
            distinct: ['codeclass'],
            where: { ...where, codeclass: { not: null } },
            orderBy: { libeclass: 'asc' }
        });

        // Get unique Periods
        const periods = await prisma.note.findMany({
            select: { libperiodexam: true },
            distinct: ['libperiodexam'],
            where: { ...where, libperiodexam: { not: null } },
            orderBy: { libperiodexam: 'asc' }
        });

        // Get unique Subjects
        const subjects = await prisma.note.findMany({
            select: { codematiere: true, libematier: true },
            distinct: ['codematiere'],
            where: { ...where, codematiere: { not: null } },
            orderBy: { libematier: 'asc' }
        });

        return NextResponse.json({
            academicYears: academicYears.map(p => p.as),
            teachers: teachers.map(t => ({ id: t.iuense, name: t.libens })),
            classes: classes.map(c => ({ id: c.codeclass, name: c.libeclass })),
            periods: periods.map(p => p.libperiodexam),
            subjects: subjects.map(s => ({ id: s.codematiere, name: s.libematier }))
        });
    } catch (error: any) {
        console.error("Error fetching note filters:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
