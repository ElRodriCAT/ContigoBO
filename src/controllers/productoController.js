const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const productos = await prisma.producto.findMany();
  res.json(productos);
};

exports.crear = async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    if (!nombre || precio === undefined || stock === undefined || precio < 0 || stock < 0) {
      return res.status(400).send('Todos los campos son requeridos y los valores numéricos no pueden ser negativos.');
    }
    await prisma.producto.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock)
      }
    });
    res.redirect('/productos');
  } catch (err) {
    res.status(500).send('Error al crear producto');
  }
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
