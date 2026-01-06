import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
    const classes = await prisma.class.count()
    return NextResponse.json(classes)
}