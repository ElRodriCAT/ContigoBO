const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function crearDatosPrueba() {
  try {
    console.log('Verificando datos existentes...');
    
    // Verificar si ya hay productos
    const productosExistentes = await prisma.producto.count();
    
    if (productosExistentes < 5) {
      console.log('Creando productos de prueba...');
      await prisma.producto.createMany({
        data: [
          { nombre: 'Hamburguesa Clásica', precio: 12.50, stock: 50 },
          { nombre: 'Hamburguesa Doble', precio: 16.80, stock: 30 },
          { nombre: 'Papas Fritas', precio: 5.50, stock: 100 },
          { nombre: 'Bebida Cola', precio: 3.20, stock: 80 },
          { nombre: 'Hamburguesa BBQ', precio: 18.90, stock: 25 },
          { nombre: 'Nuggets de Pollo', precio: 8.75, stock: 60 }
        ]
      });
      console.log('Productos creados correctamente');
    } else {
      console.log('Ya existen productos, omitiendo creación...');
    }

    // Crear ventas de prueba de los últimos días
    const ventasExistentes = await prisma.venta.count();
    
    if (ventasExistentes < 10) {
      console.log('Creando ventas de prueba...');
      const productos = await prisma.producto.findMany();
      
      if (productos.length === 0) {
        console.log('No hay productos disponibles para crear ventas');
        return;
      }
      
      for (let i = 0; i < 15; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));
        
        const productosSeleccionados = productos
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);
        
        let total = 0;
        const detalles = productosSeleccionados.map(producto => {
          const cantidad = Math.floor(Math.random() * 3) + 1;
          const precio = producto.precio;
          total += precio * cantidad;
          return {
            productoId: producto.id,
            cantidad: cantidad,
            precio: precio
          };
        });
        
        await prisma.venta.create({
          data: {
            fecha: fecha,
            total: total,
            detalles: {
              create: detalles
            }
          }
        });
      }
      console.log('Ventas creadas correctamente');
    } else {
      console.log('Ya existen suficientes ventas, omitiendo creación...');
    }
    
    console.log('Datos de prueba procesados exitosamente');
    
    // Mostrar resumen
    const totalProductos = await prisma.producto.count();
    const totalVentas = await prisma.venta.count();
    console.log(`Resumen: ${totalProductos} productos, ${totalVentas} ventas en la base de datos`);
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearDatosPrueba();