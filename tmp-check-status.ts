import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    const page = await prisma.page.findFirst({
      where: { slug: 'partner-new-partner' },
      select: { id: true, slug: true, status: true, title: true },
    });

    if (!page) {
      throw new Error('partner-new-partner not found');
    }

    const updated = await prisma.page.update({
      where: { id: page.id },
      data: { status: 'ARCHIVED' },
      select: { id: true, slug: true, status: true, title: true },
    });

    console.log(JSON.stringify(updated, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
