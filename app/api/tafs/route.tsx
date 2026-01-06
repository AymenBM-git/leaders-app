import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {

  try{  
        const tafs = await prisma.taf.findMany({
            orderBy: {
                dateTaf: 'desc'
            },
            include: {
                subject: true,
                class: true
            }
        })
        return NextResponse.json(tafs)
        } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch taf' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()//.formData()

        const { dateTaf, type, subjectId, description, classId } = json

        const taf = await prisma.taf.create({
            data: {
                dateTaf: new Date(dateTaf),
                type,
                subjectId:Number(subjectId)||null,
                description,
                classId:classId? Number(classId) : null
            }
        })

        // 1. Log Activity
            const cookiesStore = cookies();
            const nameuser= String((await cookiesStore).get('user-name')?.value);
            await prisma.activity.create({
                data: {
                    nameUser: nameuser,
                    description: `a créé le TAF/Devoir: ${taf.description}.`,
                }
            });
            
        return NextResponse.json(taf)
    } catch (error) {
        console.error("Error creating taf:", error)
        return NextResponse.json({ error: "Failed to create taf" }, { status: 500 })
    }
}
