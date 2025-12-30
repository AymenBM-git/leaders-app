import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const [students, teachers, parents] = await Promise.all([
            prisma.student.findMany({
                where: {
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                        { idenelev: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: { id: true, firstName: true, lastName: true, classId: true, photo: true },
            }),
            prisma.teacher.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: { id: true, name: true, photo: true },
            }),
            prisma.parent.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query, mode: 'insensitive' } },
                        { username: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: { id: true, name: true },
            }),
        ]);

        const results = [
            ...students.map(s => ({
                id: `student-${s.id}`,
                type: 'student',
                title: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Élève sans nom',
                subtitle: `ID: ${s.id || 'N/A'}`,
                href: `/students/${s.id}`,
                photo: `../${s.photo}`,
            })),
            ...teachers.map(t => ({
                id: `teacher-${t.id}`,
                type: 'teacher',
                title: t.name || 'Enseignant sans nom',
                subtitle: 'Enseignant',
                href: `/teachers/${t.id}`,
                photo: `../${t.photo}`,
            })),
            ...parents.map(p => ({
                id: `parent-${p.id}`,
                type: 'parent',
                title: p.name || 'Parent sans nom',
                subtitle: 'Parent',
                href: `/parents/${p.id}`,
            })),
        ];

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
