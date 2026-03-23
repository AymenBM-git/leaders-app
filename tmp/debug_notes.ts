import prisma from '../lib/prisma';

async function main() {
    console.log("Checking NoteDevoir records...");
    const notes = await prisma.noteDevoir.findMany({
        include: {
            student: { select: { firstName: true, lastName: true } },
            subject: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(notes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
