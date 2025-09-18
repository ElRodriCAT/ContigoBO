exports.login = async (req, res) => {
  const { nombre, password } = req.body;
  const usuario = await prisma.usuario.findUnique({ where: { nombre } });
  if (!usuario) {
    return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
  }
  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
  }
  res.json({ ok: true });
};
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.crear = async (req, res) => {
  const { nombre, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const usuario = await prisma.usuario.create({
      data: { nombre, password: hash }
    });
    res.json({ ok: true, usuario });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};
