import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { header, noteelevList, examTypes } = body;

        if (!header || !noteelevList || !Array.isArray(noteelevList)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const { iuense, libperiodexam, codeclass } = header;

        // Calculate Current Academic Year (AS)
        const now = new Date();
        const year = now.getFullYear();
        const as = now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

        // Create a lookup map for exam types
        const examTypesMap = new Map();
        if (Array.isArray(examTypes)) {
            examTypes.forEach((et: any) => {
                const key = `${et.CODETYPEEPRE}_${et.NUMEEPRE}`;
                examTypesMap.set(key, {
                    abretypeeprear: et.abretypeeprear,
                    libTypeEpr: et.libTypeEpr,
                    codeTypeEpre: et.CODETYPEEPRE,
                    numEpre: et.NUMEEPRE
                });
            });
        }

        // Perform upsert inside a transaction
        await prisma.$transaction(async (tx) => {
            // Delete existing notes for this AS, period, teacher, class and subject to ensure sync
            await tx.note.deleteMany({
                where: {
                    as: as,
                    libperiodexam: libperiodexam,
                    iuense: iuense,
                    codeclass: codeclass,
                    codematiere: header.codematiere
                },
            });

            // Prepare all notes for bulk insertion
            const notesToCreate = noteelevList.map((entry: any) => {
                const examKey = `${entry.CODETYPEEPRE}_${entry.NUMEEPRE}`;
                const labels = examTypesMap.get(examKey) || { abretypeeprear: "", libTypeEpr: "", codeTypeEpre: entry.CODETYPEEPRE, numEpre: entry.NUMEEPRE };

                const rawNote = String(entry.NOTEEPRE);
                const noteValue = (rawNote === "--.--" || rawNote === "") ? null : parseFloat(rawNote);

                return {
                    as: as,
                    libperiodexam: libperiodexam,
                    idenelev: String(entry.IDENELEV),
                    prenomnom: entry.prenomnom,
                    libematier: header.libematier,
                    codematiere: header.codematiere,
                    abretypeeprear: labels.abretypeeprear,
                    libTypeEpr: labels.libTypeEpr,
                    codeTypeEpre: Number(labels.codeTypeEpre),
                    numEpre: Number(labels.numEpre),
                    iuense: iuense,
                    libens: header.libens,
                    libeclass: header.libeclass,
                    codeclass: codeclass,
                    noteepre: noteValue,
                };
            });

            // Bulk insert new notes
            await tx.note.createMany({
                data: notesToCreate,
            });
        });

        return NextResponse.json({ success: true, message: "Notes synchronized successfully" });
    } catch (error: any) {
        console.error("Error syncing notes:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
