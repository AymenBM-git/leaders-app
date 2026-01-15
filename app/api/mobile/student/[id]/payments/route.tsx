import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const payments = await prisma.payment.findMany({
            where: { studentId: Number(params.id) },
            orderBy: { paymentDate: 'desc' }
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Fetch payments error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
