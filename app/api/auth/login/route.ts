import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { login, password } = await request.json();

        if (!login || !password) {
            return NextResponse.json(
                { message: 'Identifiant et mot de passe requis' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { login },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Identifiant ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Verify password
        // Note: This will fail for legacy plain text passwords in the DB if not handled.
        // Ideally, we migrate legacy passwords. For now, we assume migration or new users.
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Identifiant ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Fetch teacher name if applicable
        let displayName = user.login;
        if (user.role === 'prof' && user.idTeach) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: user.idTeach },
            });
            if (teacher && teacher.name) {
                displayName = teacher.name;
            }
        }

        // Return user info (excluding password)
        return NextResponse.json({
            login: user.login,
            role: user.role,
            displayName: displayName
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Une erreur est survenue lors de la connexion' },
            { status: 500 }
        );
    }
}
