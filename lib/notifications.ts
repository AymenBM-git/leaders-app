import prisma from './prisma';

export async function createNotification(parentId: number, title: string, message: string, type: string) {
    try {
        await prisma.notification.create({
            data: {
                parentId,
                title,
                message,
                type,
            }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

export async function notifyParentsOfStudent(studentId: number, title: string, message: string, type: string) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { parentId: true }
    });

    if (student?.parentId) {
        await createNotification(student.parentId, title, message, type);
    }
}

export async function notifyParentsOfClass(classId: number, title: string, message: string, type: string) {
    const students = await prisma.student.findMany({
        where: { classId: classId },
        select: { parentId: true }
    });

    const parentIds = Array.from(new Set(students.map(s => s.parentId).filter(id => id !== null))) as number[];

    for (const parentId of parentIds) {
        await createNotification(parentId, title, message, type);
    }
}

export async function notifyAllParents(title: string, message: string, type: string) {
    const parents = await prisma.parent.findMany({
        select: { id: true }
    });

    for (const parent of parents) {
        await createNotification(parent.id, title, message, type);
    }
}
