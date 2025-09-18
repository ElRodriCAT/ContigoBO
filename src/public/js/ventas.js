document.addEventListener('DOMContentLoaded', function() {
  var tabla = document.getElementById('tabla-ventas');
  if (tabla) {
    tabla.addEventListener('click', function(e) {
      if (e.target.classList.contains('eliminar-venta')) {
        const fila = e.target.closest('tr');
        if (fila) fila.remove();
      }
    });
  }
});
