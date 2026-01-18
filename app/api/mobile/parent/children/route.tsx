import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isParentActive } from '../../../../../lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');

        if (!parentId) {
            return NextResponse.json({ error: "parentId is required" }, { status: 400 });
        }

        const isActive = await isParentActive(parentId);
        if (!isActive) {
            return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
        }

        const students = await prisma.student.findMany({
            where: { parentId: Number(parentId) },
            include: {
                classe: true
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Fetch children error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
