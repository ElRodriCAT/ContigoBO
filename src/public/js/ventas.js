document.addEventListener('DOMContentLoaded', function() {
  var tabla = document.getElementById('tabla-ventas');
  if (tabla) {
    tabla.addEventListener('click', function(e) {
      if (e.target.classList.contains('eliminar-venta')) {
        const fila = e.target.closest('tr');
        const ventaId = fila.getAttribute('data-id');
        
        if (confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción también eliminará todos los detalles asociados.')) {
          eliminarVenta(ventaId, fila);
        }
      }
    });
  }
});

async function eliminarVenta(id, fila) {
  try {
    // Deshabilitar el botón para evitar múltiples clics
    const boton = fila.querySelector('.eliminar-venta');
    boton.disabled = true;
    boton.textContent = 'Eliminando...';
    
    const response = await fetch(`/api/ventas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Eliminar la fila de la tabla con animación
      fila.style.opacity = '0.5';
      setTimeout(() => {
        fila.remove();
        mostrarMensaje('Venta eliminada correctamente', 'success');
      }, 300);
    } else {
      // Mostrar error específico
      mostrarMensaje(data.error || 'Error al eliminar la venta', 'error');
      // Restaurar el botón
      boton.disabled = false;
      boton.textContent = 'Eliminar';
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión al eliminar la venta', 'error');
    // Restaurar el botón
    const boton = fila.querySelector('.eliminar-venta');
    boton.disabled = false;
    boton.textContent = 'Eliminar';
  }
}

function mostrarMensaje(mensaje, tipo) {
  // Crear elemento de mensaje
  const div = document.createElement('div');
  div.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.right = '20px';
  div.style.zIndex = '9999';
  div.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  // Agregar al body
  document.body.appendChild(div);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (div.parentNode) {
      div.remove();
    }
  }, 5000);
}
