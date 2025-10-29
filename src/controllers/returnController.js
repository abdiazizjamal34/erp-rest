import prisma from "../config/prisma.js";

// body: { order_id, items: [{product_id, quantity, refund_amount}] }
export async function createReturn(req, res, next) {
  try {
    const { order_id, items = [], status = "PENDING" } = req.body;
    if (!order_id) return res.status(400).json({ message: "order_id required" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "items required" });

    const saved = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({ where: { order_id } });
      if (!order) throw new Error("Order not found");

      const refund_total = items.reduce((sum, it) => sum + Number(it.refund_amount || 0), 0);
      const ret = await tx.returns.create({
        data: { order_id, refund_amount: refund_total.toString(), status }
      });

      for (const it of items) {
        await tx.return_items.create({
          data: {
            return_id: ret.return_id,
            product_id: it.product_id,
            quantity: Number(it.quantity),
            refund_amount: (it.refund_amount || 0).toString()
          }
        });
        const inv = await tx.inventory.findUnique({ where: { product_id: it.product_id } });
        const newQty = (inv?.quantity || 0) + Number(it.quantity);
        await tx.inventory.upsert({
          where: { product_id: it.product_id },
          create: { product_id: it.product_id, quantity: newQty },
          update: { quantity: newQty, updated_at: new Date() }
        });
        await tx.inventory_transactions.create({
          data: {
            product_id: it.product_id,
            change_type: "RETURN_INCREASE",
            quantity_change: Number(it.quantity),
            related_return_id: ret.return_id
          }
        });
      }

      return ret;
    });

    res.status(201).json(saved);
  } catch (e) { next(e); }
}

export async function list(req, res, next) {
  try {
    const data = await prisma.returns.findMany({ include: { return_items: true } });
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await prisma.returns.findUnique({
      where: { return_id: req.params.id },
      include: { return_items: true }
    });
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) { next(e); }
}
