import prisma from "../config/prisma.js";

export async function list(req, res, next) {
  try {
    const data = await prisma.customers.findMany();
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await prisma.customers.findUnique({ where: { customer_id: req.params.id } });
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const created = await prisma.customers.create({ data: { name, email, phone } });
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const updated = await prisma.customers.update({
      where: { customer_id: req.params.id },
      data: { name, email, phone }
    });
    res.json(updated);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.customers.delete({ where: { customer_id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
}
