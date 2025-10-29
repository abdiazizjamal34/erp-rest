import prisma from "../config/prisma.js";

export async function listMethods(req, res, next) {
  try {
    const data = await prisma.payment_methods.findMany();
    res.json(data);
  } catch (e) { next(e); }
}

export async function createMethod(req, res, next) {
  try {
    const { method_name, description } = req.body;
    const created = await prisma.payment_methods.create({ data: { method_name, description } });
    res.status(201).json(created);
  } catch (e) { next(e); }
}
