import { PrismaClient } from '../lib/generated/prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const notes = await prisma.noteDevoir.findMany({
            include: {
                student: true,
                subject: true,
                class: true
            }
        });
        console.log("Total Notes in NoteDevoir:", notes.length);
        notes.forEach(n => {
            console.log(`Student: ${n.student?.firstName} ${n.student?.lastName}, Subject: ${n.subject?.name}, Type: ${n.libTypeEpr}, Note: ${n.noteepre}, AS: ${n.as}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
