const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const ventas = await prisma.venta.findMany({ include: { detalles: true } });
  res.json(ventas);
};

exports.crear = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { total, fecha } = req.body;
    console.log('Total:', total, 'Fecha:', fecha);
    
    // Validar total
    if (total === undefined || total === '' || parseFloat(total) < 0) {
      return res.status(400).send('El total es requerido y no puede ser negativo.');
    }
    
    // Si no hay fecha, usar la fecha actual
    const fechaVenta = fecha && fecha.trim() !== '' ? new Date(fecha) : new Date();
    
    await prisma.venta.create({
      data: {
        total: parseFloat(total),
        fecha: fechaVenta
      }
    });
    res.redirect('/ventas');
  } catch (err) {
    console.error('Error al crear venta:', err);
    res.status(500).send('Error al crear venta');
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar que el ID es válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar si la venta existe
    const ventaExiste = await prisma.venta.findUnique({
      where: { id },
      include: { detalles: true }
    });

    if (!ventaExiste) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Eliminar la venta (los detalles se eliminarán en cascada)
    await prisma.venta.delete({ 
      where: { id } 
    });

    res.json({ 
      eliminado: true, 
      mensaje: 'Venta eliminada correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar venta:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor al eliminar la venta'
    });
  }
};
