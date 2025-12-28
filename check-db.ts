import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const subjects = await prisma.subject.findMany({
        include: {
            _count: {
                select: { teachers: true }
            }
        }
    })

    console.log('Subjects and teacher counts:')
    subjects.forEach(s => {
        console.log(`${s.name}: ${s._count.teachers} teachers`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
