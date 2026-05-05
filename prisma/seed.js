const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

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
    },
  });
  console.log("Created admin:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@ongudai-camp.ru" },
    update: {},
    create: {
      email: "user@ongudai-camp.ru",
      name: "Тестовый Пользователь",
      password: userPassword,
      role: "subscriber",
    },
  });
  console.log("Created user:", user.email);

  // Create packages
  const packages = [
    { name: "Basic", price: 0, duration: 30, postsLimit: 1, featured: false },
    { name: "Standard", price: 990, duration: 365, postsLimit: 5, featured: false },
    { name: "Premium", price: 2990, duration: 365, postsLimit: 0, featured: true },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }
  console.log("Created packages");

  // Create hotels
  const hotels = [
    {
      title: "Горный Алтай Отель",
      slug: "gorny-altay-hotel",
      type: "hotel",
      content: "Уютный отель в центре Онгудая с видом на горы. Комфортабельные номера, сауна, ресторан с местной кухней.",
      address: "с. Онгудай, ул. Центральная, 15",
      price: 3500,
      salePrice: 2800,
      latitude: 50.7358,
      longitude: 85.7867,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/hotels/hotel1.jpg",
      rating: 4.5,
      reviewCount: 12,
    },
    {
      title: "Туристическая База Золотой Алтай",
      slug: "tur-baza-zolotoy-altay",
      type: "hotel",
      content: "Живописная база отдыха на берегу реки Катунь. Домики, палаточный городок, активные туры.",
      address: "с. Онгудай, берег р. Катунь",
      price: 2500,
      latitude: 50.7401,
      longitude: 85.7923,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/hotels/hotel2.jpg",
      rating: 4.2,
      reviewCount: 8,
    },
    {
      title: "Guest House Алтайская Сказка",
      slug: "guest-house-altayskaya-skazka",
      type: "hotel",
      content: "Гостевой дом с домашним уютом. Вкусные завтраки, экскурсионное бюро, трансфер.",
      address: "с. Онгудай, ул. Лесная, 8",
      price: 1800,
      salePrice: 1500,
      latitude: 50.7322,
      longitude: 85.7891,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/hotels/hotel3.jpg",
      rating: 4.8,
      reviewCount: 25,
    },
  ];

  for (const hotelData of hotels) {
    const hotel = await prisma.post.upsert({
      where: { slug: hotelData.slug },
      update: hotelData,
      create: hotelData,
    });

    // Add rooms for each hotel
    const rooms = [
      {
        postId: hotel.id,
        title: "Стандарт",
        description: "Уютный номер с видом во двор",
        price: hotelData.price,
        guests: 2,
        beds: 1,
        bathrooms: 1,
      },
      {
        postId: hotel.id,
        title: "Люкс с видом на горы",
        description: "Просторный номер с балконом и видом на горы",
        price: hotelData.price * 1.5,
        guests: 3,
        beds: 2,
        bathrooms: 1,
      },
    ];

    for (const room of rooms) {
      await prisma.room.create({
        data: room,
      });
    }

    // Add amenities as meta
    const amenities = JSON.stringify(["Wi-Fi", "Парковка", "Сауна", "Ресторан", "Трансфер"]);
    await prisma.postMeta.create({
      data: {
        postId: hotel.id,
        key: "amenities",
        value: amenities,
      },
    });
  }
  console.log("Created hotels with rooms");

  // Create tours
  const tours = [
    {
      title: "Величественный Алтай - 3 дня",
      slug: "velichestvennyy-altay-3-dnya",
      type: "tour",
      content: "Увлекательный тур по самым живописным местам Онгудайского района. Посещение древних курганов, горы Белуха (вид с обзорной площадки), водопадов.",
      address: "с. Онгудай и окрестности",
      price: 15000,
      salePrice: 12000,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/tours/tour1.jpg",
      rating: 4.7,
      reviewCount: 15,
    },
    {
      title: "Конный поход к Караколу",
      slug: "konnyy-pohod-k-karakolu",
      type: "tour",
      content: "Трехдневный конный поход к озеру Каракол. Ночевки в юртах, национальная кухня, незабываемые виды.",
      address: "Озеро Каракол",
      price: 25000,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/tours/tour2.jpg",
      rating: 4.9,
      reviewCount: 8,
    },
    {
      title: "Джиппинг по Алтаю",
      slug: "jipping-po-altayu",
      type: "tour",
      content: "Экстремальная поездка на джипах по труднодоступным местам Алтая. Горные перевалы, дикие реки, ночевка в палатках.",
      address: "Онгудайский район",
      price: 35000,
      salePrice: 30000,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/tours/tour3.jpg",
      rating: 4.6,
      reviewCount: 11,
    },
  ];

  for (const tourData of tours) {
    const tour = await prisma.post.upsert({
      where: { slug: tourData.slug },
      update: tourData,
      create: tourData,
    });

    // Add tour details as meta
    const metaData = [
      { key: "duration", value: "3 дня / 2 ночи" },
      { key: "groupSize", value: "6-12" },
      { key: "difficulty", value: tourData.slug.includes("jipping") ? "Сложный" : "Средний" },
    ];

    for (const meta of metaData) {
      await prisma.postMeta.create({
        data: {
          postId: tour.id,
          key: meta.key,
          value: meta.value,
        },
      });
    }
  }
  console.log("Created tours");

  // Create activities
  const activities = [
    {
      title: "Рафтинг на Катуни",
      slug: "rafting-na-katuni",
      type: "activity",
      content: "Захватывающий сплав по реке Катунь на рафтах. Маршруты различной сложности для новичков и опытных.",
      address: "р. Катунь, Онгудайский район",
      price: 3500,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/activities/rafting.jpg",
      rating: 4.8,
      reviewCount: 30,
    },
    {
      title: "Конные прогулки",
      slug: "konnye-progulki",
      type: "activity",
      content: "Верховые прогулки по живописным местам вокруг Онгудая. Маршруты от 1 часа до целого дня.",
      address: "с. Онгудай",
      price: 1500,
      salePrice: 1200,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/activities/horse.jpg",
      rating: 4.5,
      reviewCount: 18,
    },
    {
      title: "Треккинг к водопаду",
      slug: "trekking-k-vodopadu",
      type: "activity",
      content: "Пеший поход к красивейшему водопаду в окрестностях Онгудая. Протяженность 8 км, перепад высот 300 м.",
      address: "с. Онгудай, тропа к водопаду",
      price: 800,
      status: "publish",
      authorId: admin.id,
      featuredImage: "/images/activities/trekking.jpg",
      rating: 4.6,
      reviewCount: 22,
    },
  ];

  for (const activityData of activities) {
    await prisma.post.upsert({
      where: { slug: activityData.slug },
      update: activityData,
      create: activityData,
    });
  }
  console.log("Created activities");

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
