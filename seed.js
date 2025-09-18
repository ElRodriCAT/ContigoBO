const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Crear productos de ejemplo
  const producto1 = await prisma.producto.create({
    data: { nombre: 'Hamburguesa', precio: 30, stock: 50 }
  });
  const producto2 = await prisma.producto.create({
    data: { nombre: 'Papas Fritas', precio: 15, stock: 100 }
  });
  const producto3 = await prisma.producto.create({
    data: { nombre: 'Gaseosa', precio: 10, stock: 80 }
  });

  // Crear una venta de ejemplo
  const venta1 = await prisma.venta.create({
    data: {
      total: 55,
      detalles: {
        create: [
          { productoId: producto1.id, cantidad: 1, precio: 30 },
          { productoId: producto2.id, cantidad: 1, precio: 15 },
          { productoId: producto3.id, cantidad: 1, precio: 10 },
        ]
      }
    },
    include: { detalles: true }
  });

  console.log('Productos y venta de ejemplo creados correctamente.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
