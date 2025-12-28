import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: Number(params.id)
        },
        include: {
            subject: true,
            user: true
        }
    })
    return NextResponse.json(teacher)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const formData = await request.formData();

    // Extract fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;
    const diploma = formData.get('diploma') as string;
    const subjectId = formData.get('subjectId') ? parseInt(formData.get('subjectId') as string) : null;
    const file = formData.get('photo') as File | null;

    let photoPath = undefined;

    // Handle File Upload if exists
    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name;
        const ext = path.extname(originalName);
        const filename = `${id}${ext}`; // Update existing file with same ID

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'teachers');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        photoPath = `/uploads/teachers/${filename}`;
    }

    const teacher = await prisma.teacher.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name,
            email,
            phone,
            gender,
            diploma,
            subjectId,
            ...(photoPath && { photo: photoPath }), // Only update photo if new one uploaded
        },
        include: {
            user: true,
        },
    })

    return NextResponse.json(teacher)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const teacher = await prisma.teacher.delete({
        where: {
            id: Number(params.id)
        }
    })
    return NextResponse.json(teacher)
}