import { cookies } from 'next/headers';
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
        whereClause.studentId = Number(p)
        }
        if (as !== "all") {
        whereClause.as = as
        }
        const total = await prisma.payment.groupBy({
            by: ['studentId','as'],
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
                student: true
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

        const { amount, type, studentId, as, title } = json

        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                type,
                studentId: Number(studentId) || null,
                as,
                title
            }
        })

        // 1. Log Activity
            const cookiesStore = cookies();
            const nameuser= String((await cookiesStore).get('user-name')?.value);
            await prisma.activity.create({
                data: {
                    nameUser: nameuser,
                    description: `a créé un payment de ${payment.amount} DT pour l'année scolaire ${payment.as}.`,
                }
            });
                
        return NextResponse.json(payment)
    } catch (error) {
        console.error("Error creating payment:", error)
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }
}
