import prisma from "../config/prisma.js";

export async function list(req, res, next) {
  try {
    const data = await prisma.inventory.findMany({ include: { product: true } });
    res.json(data);
  } catch (e) { next(e); }
}

export async function getByProduct(req, res, next) {
  try {
    const inv = await prisma.inventory.findUnique({ where: { product_id: req.params.productId } });
    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json(inv);
  } catch (e) { next(e); }
}

export async function manualAdjust(req, res, next) {
  try {
    const { product_id, quantity_change, note } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { product_id } });
      if (!inv) throw new Error("Inventory record not found for product");
      const newQty = inv.quantity + Number(quantity_change);
      if (newQty < 0) throw new Error("Insufficient stock");
      const saved = await tx.inventory.update({ where: { product_id }, data: { quantity: newQty, updated_at: new Date() } });
      await tx.inventory_transactions.create({
        data: {
          product_id,
          change_type: "MANUAL_ADJUST",
          quantity_change: Number(quantity_change),
        }
      });
      return saved;
    });
    res.json(updated);
  } catch (e) { next(e); }
}
