import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { isParentActive } from '../../../../../../lib/mobile-auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');

        if (parentId) {
            const isActive = await isParentActive(parentId);
            if (!isActive) {
                return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
            }
        }

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
