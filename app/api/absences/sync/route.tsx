import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { notifyParentsOfStudent } from '../../../../lib/notifications';

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { classId, dateAbsence, hour, teacherId, absentStudents } = json;

        if (!classId || !dateAbsence || !hour) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const targetDate = new Date(dateAbsence);

        // Fetch existing absences for this class, date and hour
        const existingAbsences = await prisma.absence.findMany({
            where: {
                classId: Number(classId),
                dateAbsence: targetDate,
                hour: hour,
            }
        });

        const existingStudentIds = existingAbsences.map(a => a.studentId);
        const incomingStudentIds = absentStudents.map((s: any) => Number(s.id));

        const toDeleteIds = existingAbsences
            .filter(a => a.studentId && !incomingStudentIds.includes(a.studentId))
            .map(a => a.id);

        const toCreateList = absentStudents.filter((s: any) => !existingStudentIds.includes(Number(s.id)));

        // Delete absences that are no longer true
        if (toDeleteIds.length > 0) {
            await prisma.absence.deleteMany({
                where: {
                    id: { in: toDeleteIds }
                }
            });
        }

        // Create new absences
        for (const student of toCreateList) {
            await prisma.absence.create({
                data: {
                    studentId: Number(student.id),
                    classId: Number(classId),
                    dateAbsence: targetDate,
                    hour: hour,
                    teacherId: teacherId ? Number(teacherId) : null,
                }
            });

            // Notify
            const formattedDate = targetDate.toLocaleDateString('fr-FR');
            await notifyParentsOfStudent(
                Number(student.id),
                "Nouvelle absence",
                `Votre enfant a été marqué absent le ${formattedDate} à ${hour}.`,
                "absence"
            );
        }

        // Log Activity
        const cookiesStore = cookies();
        const nameCookieStr = String((await cookiesStore).get('user-name')?.value || "Inconnu");
        await prisma.activity.create({
            data: {
                nameUser: nameCookieStr,
                description: `mise à jour des absences pour la classe (ID: ${classId}) le ${dateAbsence} à ${hour}`,
            }
        });

        return NextResponse.json({ 
            success: true, 
            newAbsencesCount: toCreateList.length, 
            deletedAbsencesCount: toDeleteIds.length 
        });
    } catch (error) {
        console.error("Error syncing absences:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors de la synchronisation" }, { status: 500 });
    }
}
