import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// La función POST debe tener esta firma exacta para ser válida
export async function POST(
  request: Request,
  { params }: { params: { number: string } }
) {
  const numberId = parseInt(params.number);

  if (isNaN(numberId)) {
    return NextResponse.json({ message: 'Número de rifa inválido.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { buyerName } = body;

    if (!buyerName || typeof buyerName !== 'string') {
      return NextResponse.json({ message: 'Nombre del comprador es requerido.' }, { status: 400 });
    }

    const updatedNumber = await prisma.raffleNumber.update({
      where: { id: numberId, isSold: false },
      data: {
        isSold: true,
        buyerName: buyerName,
        soldAt: new Date(),
      },
    });

    if (!updatedNumber) {
      return NextResponse.json({ message: `El número ${numberId} ya está vendido o no existe.` }, { status: 404 });
    }

    return NextResponse.json(updatedNumber);
  } catch (error) {
    console.error(`Error selling number ${numberId}:`, error);
    return NextResponse.json({ message: 'Error interno del servidor al vender el número.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// La función DELETE debe tener esta firma exacta para ser válida
// La función DELETE debe tener esta firma exacta para ser válida
export async function DELETE(
  request: Request,
  { params }: { params: { number: string } }
) {
  const numberId = parseInt(params.number);

  if (isNaN(numberId)) {
    return NextResponse.json({ message: 'Número de rifa inválido.' }, { status: 400 });
  }

  try {
    const updatedNumber = await prisma.raffleNumber.update({
      where: { id: numberId, isSold: true },
      data: {
        isSold: false,
        buyerName: null,
        soldAt: null,
      },
    });

    if (!updatedNumber) {
      return NextResponse.json({ message: `El número ${numberId} no está vendido o no existe.` }, { status: 404 });
    }

    return NextResponse.json(updatedNumber);
  } catch (error) {
    console.error(`Error desmarcando el número ${numberId}:`, error);
    return NextResponse.json({ message: 'Error interno del servidor al desmarcar el número.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}