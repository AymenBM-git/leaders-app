import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const parent = await prisma.parent.findFirst({
            where: { username }
        });

        if (!parent) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (parent.active === false) {
            return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
        }

        const passwordMatch = parent.password ? await bcrypt.compare(password, parent.password) : false;

        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // In a real app, you'd return a JWT here. 
        // For this task, we'll return the parent info.
        return NextResponse.json({
            id: parent.id,
            name: parent.name1,
            username: parent.username
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
