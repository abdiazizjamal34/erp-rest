import prisma from "../config/prisma.js";

export async function list(req, res, next) {
  try {
    const data = await prisma.orders.findMany({
      include: { order_items: true, order_payments: true, returns: true }
    });
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await prisma.orders.findUnique({
      where: { order_id: req.params.id },
      include: { order_items: true, order_payments: true, returns: true }
    });
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) { next(e); }
}

// body: { customer_id, items: [{product_id, quantity, unit_price}], status? }
export async function createOrder(req, res, next) {
  try {
    const { customer_id, items = [], status = "PENDING" } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Items required" });

    const created = await prisma.$transaction(async (tx) => {
      // check inventory availability
      for (const it of items) {
        const inv = await tx.inventory.findUnique({ where: { product_id: it.product_id } });
        if (!inv || inv.quantity < it.quantity) {
          throw new Error(`Insufficient stock for product ${it.product_id}`);
        }
      }

      const total = items.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0);
      const order = await tx.orders.create({
        data: { customer_id, status, total_amount: total.toString() }
      });

      for (const it of items) {
        const subtotal = Number(it.unit_price) * Number(it.quantity);
        await tx.order_items.create({
          data: {
            order_id: order.order_id,
            product_id: it.product_id,
            quantity: it.quantity,
            unit_price: it.unit_price.toString(),
            subtotal: subtotal.toString(),
          }
        });

        // decrement inventory
        const inv = await tx.inventory.findUnique({ where: { product_id: it.product_id } });
        await tx.inventory.update({
          where: { product_id: it.product_id },
          data: { quantity: inv.quantity - Number(it.quantity), updated_at: new Date() }
        });

        await tx.inventory_transactions.create({
          data: {
            product_id: it.product_id,
            change_type: "ORDER_DECREASE",
            quantity_change: -Number(it.quantity),
            related_order_id: order.order_id
          }
        });
      }

      return order;
    });

    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function addPayment(req, res, next) {
  try {
    const { method_id, amount, reference_no, notes } = req.body;
    const orderId = req.params.id;

    const saved = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({ where: { order_id: orderId } });
      if (!order) throw new Error("Order not found");

      const payment = await tx.order_payments.create({
        data: {
          order_id: orderId,
          payment_method_id: method_id,
          amount: amount.toString(),
          reference_no, notes
        }
      });

      const payments = await tx.order_payments.aggregate({
        _sum: { amount: true },
        where: { order_id: orderId }
      });
      const paid = Number(payments._sum.amount || 0);
      const total = Number(order.total_amount);
      const newStatus = paid >= total ? "PAID" : order.status;
      if (newStatus !== order.status) {
        await tx.orders.update({ where: { order_id: orderId }, data: { status: newStatus } });
      }

      return { payment, paid, total, status: newStatus };
    });

    res.status(201).json(saved);
  } catch (e) { next(e); }
}

export async function updateStatus(req, res, next) {
  try {
    const updated = await prisma.orders.update({
      where: { order_id: req.params.id },
      data: { status: req.body.status }
    });
    res.json(updated);
  } catch (e) { next(e); }
}
