import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        
        // Get global setting
        let globalBlock = await prisma.globalSetting.findUnique({
            where: { key: 'chat_blocked_global' }
        });
        
        if (!globalBlock) {
            // Check if it exists in DB by value, if not create
            const settings = await prisma.globalSetting.findMany({
                where: { key: 'chat_blocked_global' }
            });
            if (settings.length === 0) {
                globalBlock = await prisma.globalSetting.create({
                    data: { key: 'chat_blocked_global', value: 'false' }
                });
            } else {
                globalBlock = settings[0];
            }
        }

        let classBlock = false;
        if (classId && classId !== 'global') {
            const cls = await prisma.class.findUnique({
                where: { id: Number(classId) },
                select: { chatBlocked: true }
            });
            classBlock = cls?.chatBlocked || false;
        }

        return NextResponse.json({
            global: globalBlock.value === 'true',
            classId: classId,
            classBlocked: classBlock
        });
    } catch (error) {
        console.error("Fetch chat settings error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, targetId, blocked } = body; // type: 'global', 'class', 'student'

        if (type === 'global') {
            await prisma.globalSetting.upsert({
                where: { key: 'chat_blocked_global' },
                update: { value: String(blocked) },
                create: { key: 'chat_blocked_global', value: String(blocked) }
            });
        } else if (type === 'class') {
            await prisma.class.update({
                where: { id: Number(targetId) },
                data: { chatBlocked: !!blocked }
            });
        } else if (type === 'student') {
            await prisma.student.update({
                where: { id: Number(targetId) },
                data: { chatBlocked: !!blocked }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update chat settings error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
