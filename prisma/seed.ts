import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.postMeta.deleteMany();
  await prisma.room.deleteMany();
  await prisma.review.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userPackage.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.facility.deleteMany();

  // Create Room Types
  const roomTypes = [
    { name: "Коттедж", slug: "cottage", description: "Отдельно стоящий дом" },
    { name: "Отельный номер", slug: "hotel-room", description: "Номер в основном корпусе" },
    { name: "Алтайский аил", slug: "altai-ail", description: "Традиционное алтайское жилище" },
  ];

  for (const rt of roomTypes) {
    await prisma.roomType.create({ data: rt });
  }

  // Create Facilities
  const facilities = [
    { name: "Wi-Fi", slug: "wifi", icon: "Wifi" },
    { name: "Душ", slug: "shower", icon: "Shower" },
    { name: "Телевизор", slug: "tv", icon: "Tv" },
    { name: "Кухня", slug: "kitchen", icon: "Utensils" },
    { name: "Мангал", slug: "bbq", icon: "Flame" },
    { name: "Парковка", slug: "parking", icon: "Car" },
    { name: "Вид на горы", slug: "mountain-view", icon: "Mountain" },
    { name: "Отопление", slug: "heating", icon: "Thermometer" },
  ];

  for (const f of facilities) {
    await prisma.facility.create({ data: f });
  }

  const allRoomTypes = await prisma.roomType.findMany();
  const allFacilities = await prisma.facility.findMany();

  // Create superadmin user
  const superAdminPassword = await bcrypt.hash("superadmin123", 10);
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@ongudai-camp.ru" },
    update: {},
    create: {
      email: "superadmin@ongudai-camp.ru",
      name: "СуперАдминистратор",
      password: superAdminPassword,
      role: "superadmin",
      updatedAt: new Date(),
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ongudai-camp.ru" },
    update: {},
    create: {
      email: "admin@ongudai-camp.ru",
      name: "Администратор",
      password: adminPassword,
      role: "admin",
      updatedAt: new Date(),
    },
  });

  // Create test users
  const users = [
    { email: "user@ongudai-camp.ru", name: "Тестовый Пользователь", role: "subscriber" },
  ];

  for (const u of users) {
    const userPassword = await bcrypt.hash("user123", 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: userPassword,
        updatedAt: new Date(),
      },
    });
  }

  // Create packages
  const packages = [
    { name: "Basic", price: 0, duration: 30, postsLimit: 1, featured: false, updatedAt: new Date() },
    { name: "Standard", price: 990, duration: 365, postsLimit: 5, featured: false, updatedAt: new Date() },
    { name: "Premium", price: 2990, duration: 365, postsLimit: 0, featured: true, updatedAt: new Date() },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }

  // Helper to create translatable posts
  async function createLocalizedPost(baseData: any, translations: any, roomsConfig?: any[]) {
    const createdPosts = [];
    for (const locale of ["ru", "en", "kk"]) {
      const localeData = translations[locale] || {};
      const post = await prisma.post.create({
        data: {
          ...baseData,
          ...localeData,
          locale,
          updatedAt: new Date(),
        },
      });
      createdPosts.push(post);

      // Add custom rooms if provided
      if (roomsConfig && locale === "ru") { // Add rooms only once (linked to RU locale post for simplicity in this seed)
        for (const roomData of roomsConfig) {
          await prisma.room.create({
            data: {
              ...roomData,
              postId: post.id,
              updatedAt: new Date(),
            }
          });
        }
      } else if (baseData.type === "hotel" && !roomsConfig) {
        // Default rooms for other hotels
        const roomTitles: any = {
          ru: ["Стандарт", "Люкс"],
          en: ["Standard", "Deluxe"],
          kk: ["Стандарт", "Люкс"]
        };
        
        for (let i = 0; i < 2; i++) {
          await prisma.room.create({
            data: {
              postId: post.id,
              title: roomTitles[locale][i],
              price: baseData.price * (i === 0 ? 1 : 1.6),
              guests: 2 + i,
              beds: 1 + i,
              updatedAt: new Date(),
            }
          });
        }
      }
    }
    return createdPosts;
  }

  // Main post: Ongudai Camp
  const cottageType = allRoomTypes.find(t => t.slug === "cottage");
  const hotelRoomType = allRoomTypes.find(t => t.slug === "hotel-room");
  const ailType = allRoomTypes.find(t => t.slug === "altai-ail");

  const wifi = allFacilities.find(f => f.slug === "wifi");
  const shower = allFacilities.find(f => f.slug === "shower");
  const heating = allFacilities.find(f => f.slug === "heating");

  await createLocalizedPost(
    {
      slug: "ongudai-camp",
      type: "hotel",
      address: "Республика Алтай, Онгудайский район",
      price: 3000,
      status: "publish",
      authorId: admin.id,
      featuredImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      rating: 5.0,
      reviewCount: 50,
    },
    {
      ru: { title: "Ongudai Camp", content: "Лучшая туристическая база в самом сердце Алтая." },
      en: { title: "Ongudai Camp", content: "The best tourist base in the heart of Altai." },
      kk: { title: "Ongudai Camp", content: "Алтайдың жүрегіндегі үздік туристік кешен." }
    },
    [
      // Cottages
      { 
        title: "Коттедж двухместный", 
        price: 4000, 
        guests: 2, 
        beds: 1, 
        roomTypeId: cottageType?.id,
        amenities: "Wi-Fi, Душ, Отопление"
      },
      { 
        title: "Коттедж трехместный", 
        price: 5500, 
        guests: 3, 
        beds: 2, 
        roomTypeId: cottageType?.id,
        amenities: "Wi-Fi, Душ, Отопление"
      },
      { 
        title: "Коттедж четырехместный", 
        price: 7000, 
        guests: 4, 
        beds: 3, 
        roomTypeId: cottageType?.id,
        amenities: "Wi-Fi, Душ, Отопление"
      },
      // Hotel Rooms
      { 
        title: "Отельный номер (2 чел, 1 этаж)", 
        price: 3000, 
        guests: 2, 
        beds: 1, 
        floor: 1,
        roomTypeId: hotelRoomType?.id,
        amenities: "Wi-Fi, Душ"
      },
      { 
        title: "Отельный номер (3 чел, 1 этаж)", 
        price: 4000, 
        guests: 3, 
        beds: 2, 
        floor: 1,
        roomTypeId: hotelRoomType?.id,
        amenities: "Wi-Fi, Душ"
      },
      { 
        title: "Отельный номер (4 чел, 2 этаж)", 
        price: 5000, 
        guests: 4, 
        beds: 3, 
        floor: 2,
        roomTypeId: hotelRoomType?.id,
        amenities: "Wi-Fi, Душ"
      },
      // Altai Ail
      { 
        title: "Алтайский аил", 
        price: 2500, 
        guests: 4, 
        beds: 2, 
        roomTypeId: ailType?.id,
        amenities: "Традиционный стиль"
      },
    ]
  );

  // Other Hotels
  await createLocalizedPost(
    {
      slug: "gorny-altay-hotel",
      type: "hotel",
      address: "с. Онгудай, ул. Центральная, 15",
      price: 3500,
      salePrice: 2800,
      status: "publish",
      authorId: admin.id,
      featuredImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      rating: 4.5,
      reviewCount: 12,
    },
    {
      ru: { title: "Горный Алтай Отель", content: "Уютный отель в центре Онгудая с видом на горы." },
      en: { title: "Mountain Altai Hotel", content: "Cozy hotel in the center of Ongudai with mountain views." },
      kk: { title: "Алтай Тау қонақ үйі", content: "Онгудай орталығында тау көрінісі бар жайлы қонақ үй." }
    }
  );

  // Tours and Activities (simplified)
  await createLocalizedPost(
    {
      slug: "velichestvennyy-altay-3-dnya",
      type: "tour",
      address: "с. Онгудай и окрестности",
      price: 15000,
      status: "publish",
      authorId: admin.id,
      featuredImage: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7",
      rating: 4.7,
      reviewCount: 15,
    },
    {
      ru: { title: "Величественный Алтай - 3 дня", content: "Увлекательный тур." },
      en: { title: "Majestic Altai - 3 Days", content: "Exciting tour." },
      kk: { title: "Ұлы Алтай - 3 күн", content: "Толқытатын тур." }
    }
  );

  // Create dummy bookings
  console.log("Creating bookings...");
  const ruPosts = await prisma.post.findMany({ where: { locale: "ru" } });
  const subUsers = await prisma.user.findMany({ where: { role: "subscriber" } });

  for (let i = 0; i < 5; i++) {
    const post = ruPosts[Math.floor(Math.random() * ruPosts.length)];
    const user = subUsers[Math.floor(Math.random() * subUsers.length)];
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));

    await prisma.booking.create({
      data: {
        bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id,
        postId: post.id,
        checkIn,
        totalPrice: post.price * 2,
        status: "confirmed",
        updatedAt: new Date(),
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
