import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const as = searchParams.get('as');
        const iuense = searchParams.get('iuense');
        const codeclass = searchParams.get('codeclass');
        const libperiodexam = searchParams.get('period');
        const codematiere = searchParams.get('subject');

        if (!as || !iuense || !codeclass) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const where: any = {
            as,
            iuense,
            codeclass
        };

        if (libperiodexam) where.libperiodexam = libperiodexam;
        if (codematiere) where.codematiere = codematiere;

        const notes = await prisma.note.findMany({
            where,
            orderBy: [
                { prenomnom: 'asc' },
                { idenelev: 'asc' },
                { libperiodexam: 'asc' },
                { codeTypeEpre: 'asc' },
                { numEpre: 'asc' }
            ]
        });

        const studentsMap = new Map();
        const examTypesMap = new Map();

        notes.forEach(note => {
            if (!studentsMap.has(note.idenelev)) {
                studentsMap.set(note.idenelev, {
                    id: note.idenelev,
                    name: note.prenomnom,
                    grades: {}
                });
            }

            const student = studentsMap.get(note.idenelev);

            // Truly unique key for column (avoid collisions if abbreviations are the same)
            const columnKey = `${note.libperiodexam}|${note.codematiere}|${note.codeTypeEpre}|${note.numEpre}`;
            student.grades[columnKey] = note.noteepre;

            if (!examTypesMap.has(columnKey)) {
                examTypesMap.set(columnKey, {
                    key: columnKey,
                    abreType: note.abretypeeprear,
                    label: note.libTypeEpr,
                    period: note.libperiodexam,
                    subject: note.libematier,
                    subjectId: note.codematiere,
                    codeTypeEpre: note.codeTypeEpre,
                    numEpre: note.numEpre
                });
            }
        });

        const students = Array.from(studentsMap.values());

        // Sorting columns: 
        // 1. Period (T1 before T2)
        // 2. Subject
        // 3. Exam types (Inversed as requested: FT before FM, higher numbers first)
        const examTypes = Array.from(examTypesMap.values()).sort((a, b) => {
            const periodComp = (a.period || '').localeCompare(b.period || '');
            if (periodComp !== 0) return periodComp;

            const subjectComp = (a.subject || '').localeCompare(b.subject || '');
            if (subjectComp !== 0) return subjectComp;

            // Ascending sort: lower codeTypeEpre (FM=30) before higher (FT=40)
            if (a.codeTypeEpre !== b.codeTypeEpre) return (a.codeTypeEpre || 0) - (b.codeTypeEpre || 0);

            // Ascending numEpre (1 before 2)
            return (a.numEpre || 0) - (b.numEpre || 0);
        });

        return NextResponse.json({
            students,
            examTypes
        });
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
