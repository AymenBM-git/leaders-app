import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    const students = await prisma.student.findMany({
        include: {
            classe: true,
            parent: true
        }
    })
    return NextResponse.json(students)
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()

        // Extract fields
        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const idenelev = formData.get('idenelev') as string
        const birthday = formData.get('birthday') as string
        const classId = formData.get('classId') ? parseInt(formData.get('classId') as string) : null
        const parentId = formData.get('parentId') ? parseInt(formData.get('parentId') as string) : null
        const file = formData.get('photo') as File | null
        //const status = formData.get('status') as string
        const address = formData.get('address') as string
        const phone = formData.get('phone') as string
        const gender = formData.get('gender') as string

        let photoName = null;
        if (!file || file.size === 0) {
            if (gender === 'f') {
                photoName = 'fille.jfif';
            } else {
                photoName = 'garcon.jfif';
            }
        }

        const student = await prisma.student.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                birthday: birthday ? new Date(birthday) : null,
                idenelev: idenelev,
                classId: classId ? Number(classId) : null,
                parentId: parentId ? Number(parentId) : null,
                photo: photoName,
                status: null,
                address: address,
                phone: phone,
                gender: gender
            }
        })

        // 2. Handle File Upload if exists
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const originalName = file.name;
            const ext = path.extname(originalName);
            const filename = `${student.id}${ext}`; // ID as filename

            // Ensure directory exists
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'students');
            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // 3. Update Student with new photo path
            const updatedStudent = await prisma.student.update({
                where: { id: student.id },
                data: {
                    photo: `/uploads/students/${filename}`
                }
            });

            return NextResponse.json(updatedStudent);
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error("Error creating student:", error)
        return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
    }
}
