import { cookies } from 'next/headers';
import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const classes = await prisma.class.findMany({
        include: {
            teachers: true,
            students: true,
            schedules: true
        }
    })
    return NextResponse.json(classes)
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const newClass = await prisma.class.create({
            data: {
                name: json.name,
                level: json.level
            }
        })
        // 1. Log Activity
            const cookiesStore = cookies();
            const name= String((await cookiesStore).get('user-name')?.value);
            const namecl = (newClass.level === "1") ? "السابعة أساسي " + newClass.name : (newClass.level === "2") ? "الثامنة أساسي " + newClass.name : (newClass.level === "3") ? "التاسعة أساسي " + newClass.name : ""
            await prisma.activity.create({
                data: {
                    nameUser: name,
                    description: `a créé la classe ${namecl}`,
                }
            });
        return NextResponse.json(newClass)
    } catch (error) {
        console.error("Error creating class:", error)
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
    }
}
