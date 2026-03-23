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

        const messages = await prisma.chat.findMany({
            where: {
                OR: [
                    { sendTo: classId ? Number(classId) : null },
                ]
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

        return NextResponse.json(messages);
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
