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
  try {
    const id = parseInt(req.params.id);
    
    // Verificar que el ID es válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar si el producto existe
    const productoExiste = await prisma.producto.findUnique({
      where: { id },
      include: { detalles: true }
    });

    if (!productoExiste) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si el producto tiene ventas asociadas
    if (productoExiste.detalles && productoExiste.detalles.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
    }

    // Eliminar el producto
    await prisma.producto.delete({ where: { id } });
    
    res.json({ 
      eliminado: true, 
      mensaje: 'Producto eliminado correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    
    // Verificar si es un error de restricción de clave foránea
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor al eliminar el producto'
    });
  }
};
