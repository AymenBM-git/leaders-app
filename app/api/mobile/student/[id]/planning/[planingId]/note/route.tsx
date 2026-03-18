import { NextResponse } from 'next/server';
import prisma from '../../../../../../../../lib/prisma';
import { isParentActive } from '../../../../../../../../lib/mobile-auth';

export async function POST(request: Request, props: { params: Promise<{ id: string, planingId: string }> }) {
    try {
        const params = await props.params;
        const studentId = Number(params.id);
        const planingId = Number(params.planingId);
        
        const body = await request.json();
        const { note, parentId } = body;

        if (!parentId) {
            return NextResponse.json({ error: "Parent ID is required" }, { status: 400 });
        }

        const isActive = await isParentActive(parentId);
        if (!isActive) {
            return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
        }

        if (typeof note !== 'number' || note < 0 || note > 10) {
            return NextResponse.json({ error: "Note must be a number between 0 and 10" }, { status: 400 });
        }

        const sessionEvaluation = await prisma.sessionEvaluation.upsert({
            where: {
                planingId_studentId: {
                    planingId: planingId,
                    studentId: studentId
                }
            },
            update: {
                note: note
            },
            create: {
                planingId: planingId,
                studentId: studentId,
                note: note
            }
        });

        return NextResponse.json(sessionEvaluation);
    } catch (error) {
        console.error("Save session note error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
