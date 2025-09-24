// Configuración de colores del tema
const colores = {
  primario: '#28a745',
  secundario: '#17a2b8', 
  exito: '#28a745',
  advertencia: '#ffc107',
  peligro: '#dc3545',
  info: '#17a2b8'
};

// Configuración base para todos los gráficos
const configBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    }
  }
};

// Inicializar gráficos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (!window.estadisticas) {
    console.error('No se encontraron datos de estadísticas');
    return;
  }

  const stats = window.estadisticas;

  // Gráfico de Ventas Diarias (Línea)
  const ctxDiarias = document.getElementById('ventasDiariasChart').getContext('2d');
  new Chart(ctxDiarias, {
    type: 'line',
    data: {
      labels: stats.ventasDiarias.map(item => item.fecha),
      datasets: [{
        label: 'Ventas Diarias ($)',
        data: stats.ventasDiarias.map(item => item.total),
        borderColor: colores.primario,
        backgroundColor: colores.primario + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colores.primario,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      ...configBase,
      plugins: {
        ...configBase.plugins,
        title: {
          display: false
        }
      }
    }
  });

  // Gráfico de Ventas Mensuales (Barras)
  const ctxMensuales = document.getElementById('ventasMensualesChart').getContext('2d');
  new Chart(ctxMensuales, {
    type: 'bar',
    data: {
      labels: stats.ventasMensuales.map(item => item.mes),
      datasets: [{
        label: 'Ventas Mensuales ($)',
        data: stats.ventasMensuales.map(item => item.total),
        backgroundColor: colores.secundario,
        borderColor: colores.secundario,
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      ...configBase,
      plugins: {
        ...configBase.plugins,
        title: {
          display: false
        }
      }
    }
  });

  // Gráfico de Ventas Anuales (Barras)
  const ctxAnuales = document.getElementById('ventasAnualesChart').getContext('2d');
  new Chart(ctxAnuales, {
    type: 'bar',
    data: {
      labels: stats.ventasAnuales.map(item => item.año.toString()),
      datasets: [{
        label: 'Ventas Anuales ($)',
        data: stats.ventasAnuales.map(item => item.total),
        backgroundColor: colores.advertencia,
        borderColor: colores.advertencia,
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      ...configBase,
      plugins: {
        ...configBase.plugins,
        title: {
          display: false
        }
      }
    }
  });

  // Gráfico de Productos Populares (Barras horizontales)
  const ctxProductos = document.getElementById('productosPopularesChart').getContext('2d');
  new Chart(ctxProductos, {
    type: 'bar',
    data: {
      labels: stats.productosPopulares.map(item => item.producto),
      datasets: [{
        label: 'Cantidad Vendida (unidades)',
        data: stats.productosPopulares.map(item => item.cantidad),
        backgroundColor: [
          colores.primario,
          colores.secundario,
          colores.advertencia,
          colores.peligro,
          colores.info
        ],
        borderColor: [
          colores.primario,
          colores.secundario,
          colores.advertencia,
          colores.peligro,
          colores.info
        ],
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.raw + ' unidades';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value + ' unidades';
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    }
  });

  console.log('Gráficos de estadísticas cargados correctamente');
});