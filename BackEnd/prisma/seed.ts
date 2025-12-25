import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  const sections = [
    { name: 'Noticias', slug: 'noticias', description: 'Novedades de Afrosandeca' },
    { name: 'Cultura', slug: 'cultura', description: 'Eventos y tradiciones' },
    { name: 'Deportes', slug: 'deportes', description: 'Torneos y actividades físicas' },
    { name: 'Clasificados', slug: 'clasificados', description: 'Compra, venta y servicios' },
    { name: 'General', slug: 'general', description: 'Discusión abierta' },
  ];

  for (const section of sections) {
    const exists = await prisma.section.findUnique({ where: { slug: section.slug } });
    if (!exists) {
      await prisma.section.create({ data: section });
      console.log(`✅ Sección creada: ${section.name}`);
    }
  }

  console.log('🚀 Seeding completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });