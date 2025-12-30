import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const p = searchParams.get("p")
  const as = searchParams.get("as")

  try{  
    if (p && as) {
        // cas : /route?p=2&as=2024/2025
        const whereClause: any = {};

        if (p !== "all") {
        whereClause.parentId = Number(p)
        }
        if (as !== "all") {
        whereClause.as = as
        }
        const total = await prisma.payment.groupBy({
            by: ['parentId','as'],
            _sum: {
            amount: true,
            },
            where: {
            ...whereClause
            }
        }); 
        return NextResponse.json(total);
    }
        const payments = await prisma.payment.findMany({
            include: {
                parent: true
            }
        })
        return NextResponse.json(payments)
        } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()//.formData()

        const { amount, type, parentId,as } = json

        const payment = await prisma.payment.create({
            data: {
                amount:Number(amount),
                type,
                parentId:Number(parentId)||null,
                as
            }
        })
        return NextResponse.json(payment)
    } catch (error) {
        console.error("Error creating payment:", error)
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }
}
