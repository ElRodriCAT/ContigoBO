const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const productos = await prisma.producto.findMany();
  res.json(productos);
};

exports.crear = async (req, res) => {
  const nuevo = await prisma.producto.create({ data: req.body });
  res.json(nuevo);
};

exports.actualizar = async (req, res) => {
  const actualizado = await prisma.producto.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(actualizado);
};

exports.eliminar = async (req, res) => {
  await prisma.producto.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ eliminado: true });
};
