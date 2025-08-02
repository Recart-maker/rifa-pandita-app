// src/app/api/numbers/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const numbers = await prisma.raffleNumber.findMany({
            orderBy: {
                id: 'asc', // Ordena los números de forma ascendente por ID
            },
        });
        return NextResponse.json(numbers);
    } catch (error) {
        console.error('Error fetching raffle numbers:', error);
        return NextResponse.json({ message: 'Error al obtener los números de la rifa.' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}