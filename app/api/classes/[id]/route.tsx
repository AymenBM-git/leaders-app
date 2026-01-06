import { cookies } from 'next/headers';
import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const classItem = await prisma.class.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            teachers: true,
            students: true,
            schedules: true
        }
    })
    return NextResponse.json(classItem)
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const json = await request.json()
    const updatedClass = await prisma.class.update({
        where: {
            id: Number(params.id)
        },
        data: {
            name: json.name,
            level: json.level,
            //teacherId: json.teacherId ? Number(json.teacherId) : null,
        }
    })
    // 1. Log Activity
        const cookiesStore = cookies();
        const name= String((await cookiesStore).get('user-name')?.value);
        const namecl = (updatedClass.level === "1") ? "السابعة أساسي " + updatedClass.name : (updatedClass.level === "2") ? "الثامنة أساسي " + updatedClass.name : (updatedClass.level === "3") ? "التاسعة أساسي " + updatedClass.name : ""
        await prisma.activity.create({
            data: {
                nameUser: name,
                description: `a modifié la classe ${namecl}`,
            }
        });
    return NextResponse.json(updatedClass)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const deletedClass = await prisma.class.delete({
        where: {
            id: Number(params.id)
        }
    })
    // 1. Log Activity
            const cookiesStore = cookies();
            const name= String((await cookiesStore).get('user-name')?.value);
            const namecl = (deletedClass.level === "1") ? "السابعة أساسي " + deletedClass.name : (deletedClass.level === "2") ? "الثامنة أساسي " + deletedClass.name : (deletedClass.level === "3") ? "التاسعة أساسي " + deletedClass.name : ""
            await prisma.activity.create({
                data: {
                    nameUser: name,
                    description: `a supprimé la classe ${namecl}`,
                }
            });
    return NextResponse.json(deletedClass)
}
