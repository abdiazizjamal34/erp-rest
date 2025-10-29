import prisma from "../config/prisma.js";

export async function list(req, res, next) {
  try {
    const data = await prisma.products.findMany({ include: { inventory: true } });
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await prisma.products.findUnique({
      where: { product_id: req.params.id },
      include: { inventory: true }
    });
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { name, sku, barcode, description, price, initial_quantity = 0 } = req.body;
    const data = await prisma.products.create({
      data: {
        name, sku, barcode, description, price: price?.toString() ?? "0",
        inventory: { create: { quantity: Number(initial_quantity) } }
      },
      include: { inventory: true }
    });
    res.status(201).json(data);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { name, sku, barcode, description, price } = req.body;
    const updated = await prisma.products.update({
      where: { product_id: req.params.id },
      data: { name, sku, barcode, description, price: price?.toString() }
    });
    res.json(updated);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.products.delete({ where: { product_id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
}
