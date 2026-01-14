import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ressouceId = parseInt(id);

        if (isNaN(ressouceId)) {
            return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 });
        }

        // 1. Get resource to find the file path
        const ressouce = await prisma.ressouce.findUnique({
            where: { id: ressouceId },
            include: { planing: true }
        });

        if (!ressouce) {
            return NextResponse.json({ error: "Ressource non trouvée" }, { status: 404 });
        }

        // 2. Delete file from filesystem if name is a path
        if (ressouce.name && ressouce.name.startsWith('/uploads/')) {
            try {
                const filePath = path.join(process.cwd(), 'public', ressouce.name);
                await unlink(filePath);
            } catch (err) {
                console.error("Failed to delete file from disk:", err);
                // Continue with DB deletion even if file removal fails (e.g. file already gone)
            }
        }

        // 3. Delete from DB
        await prisma.ressouce.delete({
            where: { id: ressouceId }
        });

        // 4. Log Activity
        const cookiesStore = await cookies();
        const nameuser = cookiesStore.get('user-name')?.value;
        await prisma.activity.create({
            data: {
                nameUser: nameuser || 'System',
                description: `a supprimé une ressource de la séance "${ressouce.planing?.name}"`,
            }
        });

        return NextResponse.json({ message: "Ressource supprimée avec succès" });
    } catch (error) {
        console.error("Error deleting ressouce:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression de la ressource" }, { status: 500 });
    }
}
