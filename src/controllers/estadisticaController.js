const { PrismaClient } = require('../../generated/prisma');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

exports.obtenerEstadisticas = async (req, res) => {
  try {
    // Obtener todas las ventas con detalles
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Estadísticas diarias: ventas de la semana en curso (7 días)
    // Se asume inicio de semana: Lunes (locale es-ES)
    const ventasDiarias = {};
    const hoy = new Date();
    // getDay: 0 (Dom) .. 6 (Sab). Convertir a índice donde 0 = Lunes
    const diaSemanaIndice = (hoy.getDay() + 6) % 7; // 0..6, 0 = Lunes
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diaSemanaIndice);
    // Inicializar los 7 días de la semana
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      ventasDiarias[fechaStr] = 0;
    }

    // Estadísticas mensuales: desglose por día del mes en curso
    const ventasMensuales = {};
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= ultimoDiaMes; d++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), d);
      const fechaStr = fecha.toISOString().split('T')[0];
      ventasMensuales[fechaStr] = 0;
    }

    // Estadísticas anuales (últimos 3 años)
    const ventasAnuales = {};
    for (let i = 0; i < 3; i++) {
      const año = new Date().getFullYear() - i;
      ventasAnuales[año] = 0;
    }

    // Procesar ventas reales
    ventas.forEach(venta => {
      const fechaVenta = new Date(venta.fecha);
      
      // Ventas diarias (semana actual)
      const fechaStr = fechaVenta.toISOString().split('T')[0];
      if (ventasDiarias.hasOwnProperty(fechaStr)) {
        ventasDiarias[fechaStr] += venta.total;
      }

      // Ventas mensuales (por día del mes en curso)
      if (ventasMensuales.hasOwnProperty(fechaStr)) {
        ventasMensuales[fechaStr] += venta.total;
      }

      // Ventas anuales
      const año = fechaVenta.getFullYear();
      if (ventasAnuales.hasOwnProperty(año)) {
        ventasAnuales[año] += venta.total;
      }
    });

    // Agregar algunos datos de ejemplo si no hay suficientes ventas
    if (ventas.length < 5) {
      // Datos de ejemplo para los últimos días
      const hoy = new Date();
      for (let i = 1; i <= 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        if (ventasDiarias.hasOwnProperty(fechaStr)) {
          ventasDiarias[fechaStr] += Math.random() * 1000 + 200;
        }
      }

      // Datos de ejemplo mensuales
      for (let i = 1; i <= 3; i++) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (ventasMensuales.hasOwnProperty(mesStr)) {
          ventasMensuales[mesStr] += Math.random() * 15000 + 5000;
        }
      }

      // Datos de ejemplo anuales
      const añoActual = new Date().getFullYear();
      ventasAnuales[añoActual] += Math.random() * 50000 + 20000;
      ventasAnuales[añoActual - 1] += Math.random() * 45000 + 18000;
    }

    // Productos más vendidos
    const productosVendidos = {};
    ventas.forEach(venta => {
      venta.detalles.forEach(detalle => {
        if (detalle.producto) {
          const nombreProducto = detalle.producto.nombre;
          if (!productosVendidos[nombreProducto]) {
            productosVendidos[nombreProducto] = 0;
          }
          productosVendidos[nombreProducto] += detalle.cantidad;
        }
      });
    });

    // Si no hay productos, agregar datos de ejemplo
    if (Object.keys(productosVendidos).length === 0) {
      productosVendidos['Hamburguesa Clásica'] = 45;
      productosVendidos['Hamburguesa Doble'] = 32;
      productosVendidos['Papas Fritas'] = 67;
      productosVendidos['Bebida Cola'] = 78;
      productosVendidos['Hamburguesa BBQ'] = 28;
    }

    const estadisticas = {
      // Mostrar la semana en curso (7 dias). Formato: 'lun 22'
      ventasDiarias: Object.entries(ventasDiarias).map(([fecha, total]) => ({
        fecha: new Date(fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        total: parseFloat(total.toFixed(2))
      })),
      // Mostrar el mes en curso desglosado por día
      ventasMensuales: Object.entries(ventasMensuales).map(([fecha, total]) => ({
        fecha: new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        total: parseFloat(total.toFixed(2))
      })),
      ventasAnuales: Object.entries(ventasAnuales).map(([año, total]) => ({
        año: parseInt(año),
        total: parseFloat(total.toFixed(2))
      })).reverse(),
      productosPopulares: Object.entries(productosVendidos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([producto, cantidad]) => ({ producto, cantidad })),
      totalVentas: ventas.length,
      ingresoTotal: ventas.reduce((sum, venta) => sum + venta.total, 0),
      ventasHoy: ventas.filter(venta => {
        const hoy = new Date();
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta.toDateString() === hoy.toDateString();
      }).length
    };

    res.render('estadisticas', { estadisticas });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).send('Error al cargar las estadísticas');
  }
};

exports.exportarExcel = async (req, res) => {
  try {
    // Obtener todas las estadísticas (reutilizar lógica del controlador principal)
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Procesar estadísticas igual que en obtenerEstadisticas
    const ventasDiarias = {};
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      ventasDiarias[fechaStr] = 0;
    }

    const ventasMensuales = {};
    for (let i = 0; i < 12; i++) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      ventasMensuales[mesStr] = 0;
    }

    const ventasAnuales = {};
    for (let i = 0; i < 3; i++) {
      const año = new Date().getFullYear() - i;
      ventasAnuales[año] = 0;
    }

    // Procesar ventas
    ventas.forEach(venta => {
      const fechaVenta = new Date(venta.fecha);
      
      const fechaStr = fechaVenta.toISOString().split('T')[0];
      if (ventasDiarias.hasOwnProperty(fechaStr)) {
        ventasDiarias[fechaStr] += venta.total;
      }

      const mesStr = `${fechaVenta.getFullYear()}-${String(fechaVenta.getMonth() + 1).padStart(2, '0')}`;
      if (ventasMensuales.hasOwnProperty(mesStr)) {
        ventasMensuales[mesStr] += venta.total;
      }

      const año = fechaVenta.getFullYear();
      if (ventasAnuales.hasOwnProperty(año)) {
        ventasAnuales[año] += venta.total;
      }
    });

    // Productos más vendidos
    const productosVendidos = {};
    ventas.forEach(venta => {
      venta.detalles.forEach(detalle => {
        if (detalle.producto) {
          const nombreProducto = detalle.producto.nombre;
          if (!productosVendidos[nombreProducto]) {
            productosVendidos[nombreProducto] = { cantidad: 0, ingresos: 0 };
          }
          productosVendidos[nombreProducto].cantidad += detalle.cantidad;
          productosVendidos[nombreProducto].ingresos += detalle.precio * detalle.cantidad;
        }
      });
    });

    // Crear el archivo Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Contigo Burgers';
    workbook.lastModifiedBy = 'Sistema de Estadísticas';
    workbook.created = new Date();

    // Hoja 1: Resumen General
    const resumenSheet = workbook.addWorksheet('Resumen General');
    resumenSheet.columns = [
      { header: 'Métrica', key: 'metrica', width: 25 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];

    const totalVentas = ventas.length;
    const ingresoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const ventasHoy = ventas.filter(venta => {
      const hoy = new Date();
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta.toDateString() === hoy.toDateString();
    }).length;

    resumenSheet.addRows([
      { metrica: 'Total de Ventas', valor: totalVentas },
      { metrica: 'Ingresos Totales', valor: `$${ingresoTotal.toFixed(2)}` },
      { metrica: 'Ventas Hoy', valor: ventasHoy },
      { metrica: 'Fecha de Generación', valor: new Date().toLocaleString('es-ES') },
      { metrica: 'Período Analizado', valor: 'Últimos 30 días' }
    ]);

    // Hoja 2: Ventas Diarias
    const diariasSheet = workbook.addWorksheet('Ventas Diarias');
    diariasSheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Ingresos ($)', key: 'ingresos', width: 15 },
      { header: 'Número de Ventas', key: 'numeroVentas', width: 18 }
    ];

    Object.entries(ventasDiarias).forEach(([fecha, total]) => {
      const ventasDelDia = ventas.filter(venta => {
        return new Date(venta.fecha).toISOString().split('T')[0] === fecha;
      }).length;

      diariasSheet.addRow({
        fecha: new Date(fecha).toLocaleDateString('es-ES'),
        ingresos: total.toFixed(2),
        numeroVentas: ventasDelDia
      });
    });

    // Hoja 3: Ventas Mensuales
    const mensualesSheet = workbook.addWorksheet('Ventas Mensuales');
    mensualesSheet.columns = [
      { header: 'Mes/Año', key: 'mes', width: 20 },
      { header: 'Ingresos ($)', key: 'ingresos', width: 15 },
      { header: 'Número de Ventas', key: 'numeroVentas', width: 18 }
    ];

    Object.entries(ventasMensuales).reverse().forEach(([mes, total]) => {
      const ventasDelMes = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        const mesVenta = `${fechaVenta.getFullYear()}-${String(fechaVenta.getMonth() + 1).padStart(2, '0')}`;
        return mesVenta === mes;
      }).length;

      mensualesSheet.addRow({
        mes: new Date(mes + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
        ingresos: total.toFixed(2),
        numeroVentas: ventasDelMes
      });
    });

    // Hoja 4: Productos Más Vendidos
    const productosSheet = workbook.addWorksheet('Productos Más Vendidos');
    productosSheet.columns = [
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Cantidad Vendida', key: 'cantidad', width: 18 },
      { header: 'Ingresos Generados ($)', key: 'ingresos', width: 22 }
    ];

    Object.entries(productosVendidos)
      .sort(([,a], [,b]) => b.cantidad - a.cantidad)
      .forEach(([producto, datos]) => {
        productosSheet.addRow({
          producto: producto,
          cantidad: datos.cantidad,
          ingresos: datos.ingresos.toFixed(2)
        });
      });

    // Aplicar estilos a las hojas
    [resumenSheet, diariasSheet, mensualesSheet, productosSheet].forEach(sheet => {
      // Estilo del header
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '28a745' }
      };
      sheet.getRow(1).alignment = { horizontal: 'center' };
      
      // Bordes para todas las celdas con datos
      sheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell({ includeEmpty: false }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });

    // Configurar la respuesta HTTP para descargar el archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Estadisticas_Contigo_${fechaActual}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generando Excel:', error);
    res.status(500).send('Error al generar el archivo Excel');
  }
};