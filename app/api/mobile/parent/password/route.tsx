import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { isParentActive } from '../../../../../lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const { oldPassword, newPassword } = await request.json();
        const parentId = request.headers.get('X-Parent-Id');

        if (!parentId || !newPassword) {
            return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
        }

        const isActive = await isParentActive(parentId);
        if (!isActive) {
            return NextResponse.json({ error: "Compte désactivé" }, { status: 403 });
        }

        const parent = await prisma.parent.findUnique({
            where: { id: Number(parentId) }
        });

        if (!parent) {
            return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });
        }

        // Verify old password
        if (parent.password && oldPassword) {
            const isValid = await bcrypt.compare(oldPassword, parent.password);
            if (!isValid) {
                return NextResponse.json({ error: "Ancien mot de passe incorrect" }, { status: 401 });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.parent.update({
            where: { id: Number(parentId) },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
