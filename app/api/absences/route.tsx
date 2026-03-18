import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server'
import { notifyParentsOfStudent } from '../../../lib/notifications';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const classIdStr = searchParams.get('classId');
    const dateStr = searchParams.get('date');
    const hourStr = searchParams.get('hour');

    if (classIdStr && dateStr && hourStr) {
        const classId = Number(classIdStr);
        const dateAbsence = new Date(dateStr);
        const absences = await prisma.absence.findMany({
            where: {
                classId,
                dateAbsence,
                hour: hourStr
            },
            include: {
                student: true
            }
        });
        return NextResponse.json(absences);
    }

    const month = new Date().getMonth() + 1;
    let date1 = "";
    let date2 = "";
    if (month >= 9) {
        date1 = new Date().getFullYear() + "-09-01";
        date2 = (new Date().getFullYear() + 1) + "-06-30";
    }
    else {
        date1 = (new Date().getFullYear() - 1) + "-09-01";
        date2 = (new Date().getFullYear()) + "-06-30";
    }
    const absence = await prisma.absence.findMany({
        where: {
            dateAbsence: {
                gte: new Date(date1),
                lte: new Date(date2),
            }
        },
        orderBy: {
            dateAbsence: 'desc'
        },
        include: {
            student: true,
            classe: true,
        }
    })
    return NextResponse.json(absence)
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const newabsence = await prisma.absence.create({
            data: {
                studentId: Number(json.studentId),
                classId: Number(json.classId),
                dateAbsence: new Date(json.dateAbsence),
                hour: json.hour,
                teacherId: json.teacherId ? Number(json.teacherId) : null,
                //codeabsence: json.codeabsence
            }
        })

        // Send notification to parent
        const formattedDate = new Date(json.dateAbsence).toLocaleDateString('fr-FR');
        await notifyParentsOfStudent(
            Number(json.studentId),
            "Nouvelle absence",
            `Votre enfant a été marqué absent le ${formattedDate} à ${json.hour}.`,
            "absence"
        );
        // 1. Log Activity
        const cookiesStore = cookies();
        const name = String((await cookiesStore).get('user-name')?.value);
        const namestud = json.studentName;
        await prisma.activity.create({
            data: {
                nameUser: name,
                description: `a ajouter l'absence de l'élève: ${namestud}`,
            }
        });
        return NextResponse.json(newabsence)
    } catch (error) {
        console.error("Error creating absence:", error)
        return NextResponse.json({ error: "Une erreur est survenue lors de la création" }, { status: 500 })
    }
}
