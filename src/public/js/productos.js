document.addEventListener('DOMContentLoaded', function() {
  var tabla = document.getElementById('tabla-productos');
  if (tabla) {
    tabla.addEventListener('click', function(e) {
      if (e.target.classList.contains('eliminar-producto')) {
        const fila = e.target.closest('tr');
        const productoId = fila.getAttribute('data-id');
        
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
          eliminarProducto(productoId, fila);
        }
      }
    });
  }
});

async function eliminarProducto(id, fila) {
  try {
    // Deshabilitar el botón para evitar múltiples clics
    const boton = fila.querySelector('.eliminar-producto');
    boton.disabled = true;
    boton.textContent = 'Eliminando...';
    
    const response = await fetch(`/api/productos/${id}`, {
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
        mostrarMensaje('Producto eliminado correctamente', 'success');
      }, 300);
    } else {
      // Mostrar error específico
      mostrarMensaje(data.error || 'Error al eliminar el producto', 'error');
      // Restaurar el botón
      boton.disabled = false;
      boton.textContent = 'Eliminar';
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión al eliminar el producto', 'error');
    // Restaurar el botón
    const boton = fila.querySelector('.eliminar-producto');
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
