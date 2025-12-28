import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'


export async function GET() {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
}

import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const json = await request.json()
    const hashedPassword = await bcrypt.hash(json.password, 10);
    if (!json.login || !json.password ) {
        return NextResponse.json(
            { error: 'Login and password are required' },
            { status: 400 }
        )
    }
    const user = await prisma.user.create({
        //data: json
        data: {
            login: json.login,
            password: hashedPassword,
            role: json.role,
            idTeach: json.idTeach || null,
        }
    })

    return NextResponse.json(user)
}
