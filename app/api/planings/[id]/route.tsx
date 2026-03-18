import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const id = parseInt((await params).id);
        const planing = await prisma.planing.findUnique({
            where: { id },
            include: { teacher: true }
        });
        if (!planing) {
            return NextResponse.json({ error: 'Planing not found' }, { status: 404 });
        }
        return NextResponse.json(planing);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch planing' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const id = parseInt((await params).id);
        const data = await request.json();
        const { teacherId, as, type, datePlaning, description, name, classId } = data;

        const planing = await prisma.planing.update({
            where: { id },
            data: {
                teacherId: teacherId ? parseInt(teacherId) : undefined,
                as,
                type,
                datePlaning: datePlaning ? new Date(datePlaning) : undefined,
                description,
                name,
                classId: classId ? parseInt(classId) : null,
            },
            include: { teacher: true }
        });

        // Log Activity
        const cookiesStore = cookies();
        const nameuser = (await cookiesStore).get('user-name')?.value;
        await prisma.activity.create({
            data: {
                nameUser: nameuser || 'System',
                description: `a modifié une répartition pour: ${planing.teacher?.name || 'Inconnu'}.`,
            }
        });

        return NextResponse.json(planing);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update planing' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const id = parseInt((await params).id);
        const planing = await prisma.planing.delete({
            where: { id },
            include: { teacher: true }
        });

        // Log Activity
        const cookiesStore = cookies();
        const nameuser = (await cookiesStore).get('user-name')?.value;
        await prisma.activity.create({
            data: {
                nameUser: nameuser || 'System',
                description: `a supprimé une répartition pour: ${planing.teacher?.name || 'Inconnu'}.`,
            }
        });

        return NextResponse.json({ message: 'Planing deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete planing' }, { status: 500 });
    }
}
