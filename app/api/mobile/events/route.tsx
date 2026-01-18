import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { isParentActive } from '../../../../lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');

        if (parentId) {
            const isActive = await isParentActive(parentId);
            if (!isActive) {
                return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
            }
        }

        const events = await prisma.event.findMany({
            where: {
                dateEvent: { gte: new Date() }
            },
            orderBy: { dateEvent: 'asc' }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error("Fetch events error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
