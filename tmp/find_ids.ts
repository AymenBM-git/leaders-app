import { PrismaClient } from '../lib/generated/prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const cls = await prisma.class.findFirst({ where: { name: '1', level: '1' } });
        const subj = await prisma.subject.findFirst({ where: { name: 'فرنسية' } });
        const student = await prisma.student.findFirst({ where: { firstName: 'walid', lastName: 'Mhamdi' } });
        
        console.log("Class ID:", cls?.id);
        console.log("Subject ID:", subj?.id);
        console.log("Student ID:", student?.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
