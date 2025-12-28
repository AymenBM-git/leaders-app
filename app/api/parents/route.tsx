import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
    const parents = await prisma.parent.findMany({
        include: {
            childrenIds: true
        }
    })
    return NextResponse.json(parents)
}

export async function POST(request: Request) {
    try {
        const json = await request.json()

        const { name, relation, email, phone, username, password } = json

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null

        const parent = await prisma.parent.create({
            data: {
                name,
                relation,
                email,
                phone,
                username,
                password: hashedPassword,
            }
        })
        return NextResponse.json(parent)
    } catch (error) {
        console.error("Error creating parent:", error)
        return NextResponse.json({ error: "Failed to create parent" }, { status: 500 })
    }
}
