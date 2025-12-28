import  prisma  from '../../../../lib/prisma';
import { NextResponse } from 'next/server'


export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: {
      login: params.id
    }
  })
  return NextResponse.json(user)
}

import bcrypt from 'bcryptjs';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const json = await request.json()

  let dataToUpdate: any = {
    login: json.login,
    role: json.role,
  };

  if (json.password) {
    dataToUpdate.password = await bcrypt.hash(json.password, 10);
  }

  const user = await prisma.user.update({
    where: {
      login: params.id
    },
    data: dataToUpdate
  })
  return NextResponse.json(user)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await prisma.user.delete({
    where: {
      login: params.id
    }
  })
  return NextResponse.json(user)
}