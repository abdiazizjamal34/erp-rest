import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Payment methods
  const methods = ["Cash", "Bank Transfer", "Card", "Mobile Money"];
  for (const m of methods) {
    await prisma.payment_methods.upsert({
      where: { method_name: m },
      update: {},
      create: { method_name: m },
    });
  }

  // Sample product with inventory
  const p = await prisma.products.create({
    data: {
      name: "Sample Widget",
      sku: "WID-001",
      price: "99.99",
      inventory: { create: { quantity: 50 } }
    },
    include: { inventory: true }
  });
  console.log("Seeded product:", p.name);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
