import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const planingId = formData.get('planingId') ? parseInt(formData.get('planingId') as string) : null;
        const classId = formData.get('classId') ? parseInt(formData.get('classId') as string) : null;
        const files = formData.getAll('files') as File[];

        if (!planingId) {
            return NextResponse.json({ error: "Planing ID is required" }, { status: 400 });
        }

        const createdRessouces = [];

        for (const file of files) {
            if (file.size === 0) continue;

            // 1. Create entry in DB first to get an ID if needed, or use filename
            const ressouce = await prisma.ressouce.create({
                data: {
                    name: file.name,
                    planingId: planingId,
                    classId: classId // can be null for all classes
                }
            });

            // 2. Save file
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name);
            const filename = `${ressouce.id}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ressouces');

            await mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // 3. Update name with the actual path or keep original name and store path separately if schema allowed
            // Our schema only has 'name', so we'll store the filename or path there.
            // Let's store the relative path for easy access.
            const updatedRessouce = await prisma.ressouce.update({
                where: { id: ressouce.id },
                data: {
                    name: `/uploads/ressouces/${filename}`
                }
            });

            createdRessouces.push(updatedRessouce);
        }

        // Log Activity
        const cookiesStore = await cookies();
        const nameuser = cookiesStore.get('user-name')?.value;
        const planing = await prisma.planing.findUnique({
            where: { id: planingId },
            include: { teacher: true }
        });

        await prisma.activity.create({
            data: {
                nameUser: nameuser || 'System',
                description: `a ajouté ${createdRessouces.length} ressource(s) pour la séance "${planing?.name}"`,
            }
        });

        return NextResponse.json(createdRessouces);
    } catch (error) {
        console.error("Error creating ressouce:", error);
        return NextResponse.json({ error: "Failed to create ressource" }, { status: 500 });
    }
}
