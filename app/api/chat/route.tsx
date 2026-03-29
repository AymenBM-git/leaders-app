import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');

        const messages = await prisma.chat.findMany({
            where: {
                sendTo: classId === 'global' ? null : (classId ? Number(classId) : undefined)
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        photo: true,
                        chatBlocked: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Fetch dashboard chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sendTo, message } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const newMessage = await prisma.chat.create({
            data: {
                studentId: null, // Null means sent by admin
                sendTo: sendTo === 'global' || !sendTo ? null : Number(sendTo),
                message: message
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Post dashboard chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.chat.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
