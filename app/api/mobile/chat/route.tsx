import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const classId = searchParams.get('classId'); // Optional, null means global chat

        if (!studentId) {
            return NextResponse.json({ error: "studentId is required" }, { status: 400 });
        }

        // Check blocks
        const globalBlock = await prisma.globalSetting.findUnique({ where: { key: 'chat_blocked_global' } });
        const isGlobalBlocked = globalBlock?.value === 'true';

        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            select: { chatBlocked: true, classId: true }
        });
        const isStudentBlocked = student?.chatBlocked || false;

        let isClassBlocked = false;
        const targetClassId = classId ? Number(classId) : student?.classId;
        if (targetClassId) {
            const cls = await prisma.class.findUnique({
                where: { id: targetClassId },
                select: { chatBlocked: true }
            });
            isClassBlocked = cls?.chatBlocked || false;
        }

        const messages = await prisma.chat.findMany({
            where: {
                sendTo: classId ? Number(classId) : null
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        photo: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({
            messages,
            isBlocked: isGlobalBlocked || isClassBlocked || isStudentBlocked,
            blockReason: isGlobalBlocked ? 'global' : (isClassBlocked ? 'class' : (isStudentBlocked ? 'student' : null))
        });
    } catch (error) {
        console.error("Fetch chat messages error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, sendTo, message } = body;

        if (!studentId || !message) {
            return NextResponse.json({ error: "studentId and message are required" }, { status: 400 });
        }

        // Check blocks before posting
        const globalBlock = await prisma.globalSetting.findUnique({ where: { key: 'chat_blocked_global' } });
        if (globalBlock?.value === 'true') {
            return NextResponse.json({ error: "Le chat global est désactivé" }, { status: 403 });
        }

        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            select: { chatBlocked: true, classId: true }
        });
        if (student?.chatBlocked) {
            return NextResponse.json({ error: "Votre accès au chat a été bloqué" }, { status: 403 });
        }

        const targetClassId = sendTo ? Number(sendTo) : student?.classId;
        if (targetClassId) {
            const cls = await prisma.class.findUnique({
                where: { id: targetClassId },
                select: { chatBlocked: true }
            });
            if (cls?.chatBlocked) {
                return NextResponse.json({ error: "Le chat de cette classe est désactivé" }, { status: 403 });
            }
        }

        const newMessage = await prisma.chat.create({
            data: {
                studentId: Number(studentId),
                sendTo: sendTo ? Number(sendTo) : null,
                message: message
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        photo: true,
                    }
                }
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Post chat message error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
