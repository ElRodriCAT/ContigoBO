const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const ventas = await prisma.venta.findMany({ include: { detalles: true } });
  res.json(ventas);
};

exports.crear = async (req, res) => {
  const { detalles, ...venta } = req.body;
  const nuevaVenta = await prisma.venta.create({
    data: {
      ...venta,
      detalles: {
        create: detalles,
      },
    },
    include: { detalles: true },
  });
  res.json(nuevaVenta);
};
