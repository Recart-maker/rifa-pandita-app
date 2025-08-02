// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el proceso de siembra...');
  const numberOfRaffleNumbers = 181; // El total de números que deseas

  for (let i = 1; i <= numberOfRaffleNumbers; i++) {
    await prisma.raffleNumber.upsert({
      where: { id: i },
      update: {}, // No actualizar si ya existe, solo asegurarse de que esté presente
      create: {
        id: i,
        isSold: false,
        buyerName: null,
        soldAt: null,
      },
    });
  }
  console.log(`Creados o actualizados ${numberOfRaffleNumbers} números de rifa.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });