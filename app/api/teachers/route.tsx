import  prisma  from '../../../lib/prisma';
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    const teachers = await prisma.teacher.findMany({
        include: {
            subject: true,
            user: true
        }
    })
    return NextResponse.json(teachers)
}

export async function POST(request: Request) {
    const formData = await request.formData()

    // Extract fields
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const gender = formData.get('gender') as string
    const diploma = formData.get('diploma') as string
    const subjectId = formData.get('subjectId') ? parseInt(formData.get('subjectId') as string) : null
    const login = formData.get('login') as string
    const password = formData.get('password') as string
    const file = formData.get('photo') as File | null

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default photo logic if no file provided
    let photoName = null;
    if (!file || file.size === 0) {
        if (gender === 'f') {
            photoName = 'femme.png';
        } else {
            photoName = 'homme.png';
        }
    }

    // 1. Create Teacher first to get ID
    const teacher = await prisma.teacher.create({
        data: {
            name,
            email,
            phone,
            gender,
            diploma,
            photo: photoName, // Temporarily set default or null
            subjectId,
            user: {
                create: {
                    login,
                    password: hashedPassword,
                    role: 'prof',
                },
            },
        },
        include: {
            user: true,
        },
    })

    // 2. Handle File Upload if exists
    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name;
        const ext = path.extname(originalName);
        const filename = `${teacher.id}${ext}`; // ID as filename

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'teachers');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // 3. Update Teacher with new photo path
        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacher.id },
            data: {
                photo: `/uploads/teachers/${filename}`
            },
            include: { user: true }
        });

        return NextResponse.json(updatedTeacher);
    }

    return NextResponse.json(teacher)
}
