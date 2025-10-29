import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function register(req, res, next) {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await prisma.users.create({
      data: { email, password: hash, name, role: role || "ADMIN" }
    });
    const token = jwt.sign({ sub: user.user_id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.user_id, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ sub: user.user_id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.user_id, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
}
