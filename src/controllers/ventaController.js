const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const ventas = await prisma.venta.findMany({ include: { detalles: true } });
  res.json(ventas);
};

exports.crear = async (req, res) => {
  try {
    const { total, createdAt } = req.body;
    if (total === undefined || createdAt === undefined || total < 0) {
      return res.status(400).send('Todos los campos son requeridos y los valores numéricos no pueden ser negativos.');
    }
    await prisma.venta.create({
      data: {
        total: parseFloat(total),
        createdAt: new Date(createdAt)
      }
    });
    res.redirect('/ventas');
  } catch (err) {
    res.status(500).send('Error al crear venta');
  }
};
