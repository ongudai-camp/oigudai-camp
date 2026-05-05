const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tours = await prisma.post.findMany({ where: { type: 'tour' } });
    console.log('Tours count:', tours.length);
    tours.forEach(t => console.log(`- ${t.title} (${t.status})`));
    
    const hotels = await prisma.post.findMany({ where: { type: 'hotel' } });
    console.log('\nHotels count:', hotels.length);
    
    const activities = await prisma.post.findMany({ where: { type: 'activity' } });
    console.log('Activities count:', activities.length);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
