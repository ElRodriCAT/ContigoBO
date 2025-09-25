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
      labels: stats.ventasMensuales.map(item => item.fecha),
      datasets: [{
        label: 'Ventas del Mes ($)',
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

// Eliminación defensiva de spinners/controles que puedan quedar sobre los charts
document.addEventListener('DOMContentLoaded', function() {
  // Selector amplio para capturar varios tipos de controles que podrían aparecer
  const selectors = [
    '.chart-container input[type=number]',
    '.chart-container [role="spinbutton"]',
    '.chart-container .spinner',
    '.chart-container .number-spinner',
    '.chart-container button',
    '.chart-container [aria-valuenow]'
  ];

  // Also target ventas form and details container and stats cards headers
  const extraSelectors = [
    '#form-ventas input[type=number]',
    '#detalles-container input[type=number]',
    '#form-ventas [role="spinbutton"]',
    '#detalles-container [role="spinbutton"]',
    '.stats-cards .card-header [role="spinbutton"]',
    '.stats-cards .card-header input',
    '.stats-cards .card-header button'
  ];

  selectors.push(...extraSelectors);

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      try {
        // quitar del DOM
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch (e) {
        // fallback: ocultar
        if (el) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
      }
    });
  });
});

// Observador para eliminar elementos que se inyecten dinámicamente dentro de los charts
(function() {
  const containers = document.querySelectorAll('.chart-container, #form-ventas, #detalles-container, .stats-cards .card-header');
  if (!containers || containers.length === 0) return;

  const suspectSelector = 'input[type=number], [role="spinbutton"], .spinner, .number-spinner, button, [aria-valuenow]';

  const observerConfig = { childList: true, subtree: true };

  const callback = function(mutationsList) {
    for (const mutation of mutationsList) {
      mutation.addedNodes.forEach(node => {
        try {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches(suspectSelector)) {
            node.remove();
            return;
          }
          // también comprobar descendientes
          node.querySelectorAll && node.querySelectorAll(suspectSelector).forEach(el => el.remove());
        } catch (e) {
          // ignorar
        }
      });
    }
  };

  containers.forEach(cont => {
    const obs = new MutationObserver(callback);
    obs.observe(cont, observerConfig);
  });
})();

// Limpieza heurística: eliminar elementos pequeños (posibles controls) dentro de headers y chart containers
(function() {
  function removeSmallControls(rootSelector) {
    document.querySelectorAll(rootSelector).forEach(root => {
      root.querySelectorAll('*').forEach(el => {
        try {
          if (!(el instanceof HTMLElement)) return;
          const rect = el.getBoundingClientRect();
          // si es muy pequeño y no tiene texto útil, removerlo
          if (rect.width <= 28 && rect.height <= 28) {
            const text = (el.textContent || '').trim();
            const aria = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('role'));
            if (!text && !aria) {
              el.remove();
            }
          }
        } catch (e) {
          // ignore
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
  removeSmallControls('.card-header');
  removeSmallControls('.chart-container');
  removeSmallControls('#form-ventas');
  removeSmallControls('#detalles-container');
  removeSmallControls('.stats-cards .card-header');

    // y ejecutar periódicamente un par de veces por si se inyectan tarde
    setTimeout(() => removeSmallControls('.card-header'), 300);
    setTimeout(() => removeSmallControls('.chart-container'), 600);
  });
})();