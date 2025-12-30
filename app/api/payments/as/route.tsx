import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const as = await prisma.payment.findMany({
            select: {
                as: true,
            },
            distinct: ['as'],
        })
        return NextResponse.json(as);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}