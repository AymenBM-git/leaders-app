import { cookies } from 'next/headers';
import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if(params.id==="0"){
        return NextResponse.json(await prisma.taf.findMany(
            {
                orderBy: {
                    dateTaf: 'desc'
                },
                include: {
                    subject: true,
                    class: true
                }
        }));
    }

    //const cookiesStore = cookies();
    const iduser= params.id//String((await cookiesStore).get('user-id')?.value);

    const teacher = await prisma.teacher.findUnique({
        where: {
            id: Number(iduser)
        },
        include: {
            subject: true
        }
    });

    if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    console.log("Teacher found:", teacher);

    
    const currentAS = (() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    return now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
                })();
    const schedules = await prisma.schedule.findMany({
    where: {
        teacherId: teacher.id,
        subjectId: teacher.subjectId,
        as: currentAS,
    },
    select: {
        classId: true,
    },
    });

    console.log("Schedules found for teacher:", schedules);

    const classIds = schedules
    .map(s => s.classId)
    .filter((id): id is number => id !== null);
    console.log("Class IDs extracted:", classIds);

    if (classIds.length === 0) {
    return NextResponse.json([]);
    }

    

    const tafs = await prisma.taf.findMany({
    where: {
        subjectId: teacher.subjectId,
        classId: {
        in: classIds,
        },
    },
    orderBy: {
        dateTaf: 'desc'
    },
    include: {
        subject: true,
        class: true,
    },
    });
    console.log("TAFs found:", tafs);
    return NextResponse.json(tafs)
}