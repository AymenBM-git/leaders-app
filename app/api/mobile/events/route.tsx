import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    try {
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
