import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Seven Sides database with food images...");

  // Clean existing data for idempotency
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.addonOption.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.branch.deleteMany({});

  // 1. Seed Branches
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: "DHA Phase 5",
        slug: "dha-phase-5",
        address: "15-A Street 2, Sector A, Phase 5, DHA, Lahore",
        phone: "923196481040",
        hoursOpen: "12 PM",
        hoursClose: "12 AM",
        deliveryFee: 150,
        deliveryRadiusKm: 5.0,
        lat: 31.4705,
        lng: 74.4075,
        isActive: true,
      },
    }),
    prisma.branch.create({
      data: {
        name: "Lake City",
        slug: "lake-city",
        address: "Lake City, Lahore",
        phone: "923196481040",
        hoursOpen: "12 PM",
        hoursClose: "12 AM",
        deliveryFee: 150,
        deliveryRadiusKm: 5.0,
        lat: 31.3653,
        lng: 74.2562,
        isActive: true,
      },
    }),
    prisma.branch.create({
      data: {
        name: "Cantt",
        slug: "cantt",
        address: "Girja Chowk, Bagh Ali Road, Cantt, Lahore",
        phone: "923227694926",
        hoursOpen: "12 PM",
        hoursClose: "12 AM",
        deliveryFee: 150,
        deliveryRadiusKm: 5.0,
        lat: 31.5204,
        lng: 74.3725,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${branches.length} branches.`);

  // 2. Seed Categories & Menu Items with Stock Food URLs
  await prisma.category.create({
    data: {
      name: "Bird Menu",
      sortOrder: 1,
      menuItems: {
        create: [
          {
            name: "The Sando",
            slug: "the-sando",
            description:
              "House bread, hot chicken tenders, cheese fondue & comeback sauce",
            price: 1070,
            imageUrl:
              "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
            hasHeatGauge: true,
            isSignature: true,
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Tenders",
      sortOrder: 2,
      menuItems: {
        create: [
          {
            name: "Red Tenders",
            slug: "red-tenders",
            description: "5 pcs of tenders served with fries & comeback sauce",
            price: 1390,
            imageUrl:
              "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
            hasHeatGauge: true,
          },
          {
            name: "Crunchy Tenders",
            slug: "crunchy-tenders",
            description: "5 pcs of tenders served with fries & comeback sauce",
            price: 1390,
            imageUrl:
              "https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80",
            hasHeatGauge: true,
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Wraps",
      sortOrder: 3,
      menuItems: {
        create: [
          {
            name: "Crispy Chicken Wrap",
            slug: "crispy-chicken-wrap",
            description:
              "Crispy chicken tenders, jalapeños, lettuce & secret sauce",
            price: 945,
            imageUrl:
              "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Sliders",
      sortOrder: 4,
      menuItems: {
        create: [
          {
            name: "Hot Chicken",
            slug: "hot-chicken-slider",
            description: "House bun, hot chicken, coleslaw, pickles",
            price: 895,
            imageUrl:
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
            hasHeatGauge: true,
          },
          {
            name: "Honey Sriracha",
            slug: "honey-sriracha-slider",
            description:
              "House bun, crispy chicken fillet, lettuce, pickles, cheese & honey sriracha sauce",
            price: 895,
            imageUrl:
              "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
            isNew: true,
          },
          {
            name: "Hot Honey Ranch",
            slug: "hot-honey-ranch-slider",
            description:
              "House bun, crispy chicken fillet, lettuce, cheese & honey ranch mayo",
            price: 895,
            imageUrl:
              "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
            isNew: true,
          },
          {
            name: "Caesar Chicken",
            slug: "caesar-chicken-slider",
            description:
              "House bun, crispy chicken fillet, lettuce & secret sauce",
            price: 895,
            imageUrl:
              "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80",
            isNew: true,
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Hand Cut Fries",
      sortOrder: 5,
      menuItems: {
        create: [
          {
            name: "Loaded Waffle Fries",
            slug: "loaded-waffle-fries",
            description:
              "Criss cross potato fries, hot chicken, pickles, parsley & sauce",
            price: 995,
            imageUrl:
              "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Hand Spun Shakes",
      sortOrder: 6,
      menuItems: {
        create: [
          {
            name: "Choco Berry",
            slug: "choco-berry-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Chocolate",
            slug: "chocolate-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Strawberry",
            slug: "strawberry-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Cookies & Cream",
            slug: "cookies-and-cream-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Vanilla",
            slug: "vanilla-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Salted Caramel",
            slug: "salted-caramel-shake",
            price: 750,
            imageUrl:
              "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Extras",
      sortOrder: 7,
      menuItems: {
        create: [
          {
            name: "Crinkle Fries",
            slug: "crinkle-fries",
            price: 400,
            imageUrl:
              "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Waffle Fries",
            slug: "waffle-fries",
            price: 400,
            imageUrl:
              "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Mac & Cheese",
            slug: "mac-and-cheese",
            price: 550,
            imageUrl:
              "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  // SS Treats
  const treatsCat = await prisma.category.create({
    data: {
      name: "SS Treats",
      sortOrder: 8,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: treatsCat.id,
      name: "Toastie",
      slug: "toastie",
      description: "Choose your flavour",
      price: 645,
      imageUrl:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
      isNew: true,
      flavorOptions: ["Nutella", "Strawberry", "Dark Choc"],
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: treatsCat.id,
      name: "Churros",
      slug: "churros",
      description: "5 churro sticks dusted with cinnamon sugar & 1 dip",
      price: 500,
      imageUrl:
        "https://images.unsplash.com/photo-1624371414361-e670ef4889d6?auto=format&fit=crop&w=800&q=80",
      flavorOptions: ["Nutella", "Caramel", "Dark Choc"],
      addonOptions: {
        create: [
          { name: "Add 1 scoop of vanilla ice cream", price: 100 },
          { name: "Extra dip", price: 200 },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Make It A Meal",
      sortOrder: 9,
      menuItems: {
        create: [
          {
            name: "Fries & Drink",
            slug: "fries-and-drink",
            price: 530,
            imageUrl:
              "https://images.unsplash.com/photo-1619881589956-5879edd600ab?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Fries & Shake",
            slug: "fries-and-shake",
            price: 1150,
            imageUrl:
              "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Drinks",
      sortOrder: 10,
      menuItems: {
        create: [
          {
            name: "Pepsi",
            slug: "pepsi",
            price: 130,
            imageUrl:
              "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Diet Pepsi",
            slug: "diet-pepsi",
            price: 130,
            imageUrl:
              "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "7Up",
            slug: "7up",
            price: 130,
            imageUrl:
              "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Mirinda",
            slug: "mirinda",
            price: 130,
            imageUrl:
              "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Water",
            slug: "water",
            price: 130,
            imageUrl:
              "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Sauce",
      sortOrder: 11,
      menuItems: {
        create: [
          {
            name: "Comeback",
            slug: "comeback-sauce",
            price: 120,
            imageUrl:
              "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Salsa",
            slug: "salsa-sauce",
            price: 120,
            imageUrl:
              "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Garlic Mayo",
            slug: "garlic-mayo-sauce",
            price: 120,
            imageUrl:
              "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Chipotle",
            slug: "chipotle-sauce",
            price: 120,
            imageUrl:
              "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    },
  });

  // 3. Seed Admin Users
  const passwordHash = bcrypt.hashSync("password123", 10);

  const dhaBranch = branches.find((b) => b.slug === "dha-phase-5");
  const lakeBranch = branches.find((b) => b.slug === "lake-city");
  const canttBranch = branches.find((b) => b.slug === "cantt");

  await prisma.adminUser.createMany({
    data: [
      {
        email: "owner@sevensides.pk",
        passwordHash,
        role: "owner",
        branchId: null,
      },
      {
        email: "dha@sevensides.pk",
        passwordHash,
        role: "branch_staff",
        branchId: dhaBranch?.id || null,
      },
      {
        email: "lakecity@sevensides.pk",
        passwordHash,
        role: "branch_staff",
        branchId: lakeBranch?.id || null,
      },
      {
        email: "cantt@sevensides.pk",
        passwordHash,
        role: "branch_staff",
        branchId: canttBranch?.id || null,
      },
    ],
  });

  const totalCategories = await prisma.category.count();
  const totalMenuItems = await prisma.menuItem.count();
  const totalAdminUsers = await prisma.adminUser.count();

  console.log(`Seeding complete:`);
  console.log(`- Categories: ${totalCategories}`);
  console.log(`- Menu Items: ${totalMenuItems}`);
  console.log(`- Admin Users: ${totalAdminUsers}`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
