document.addEventListener('DOMContentLoaded', function() {
  var tabla = document.getElementById('tabla-productos');
  if (tabla) {
    tabla.addEventListener('click', function(e) {
      if (e.target.classList.contains('eliminar-producto')) {
        const fila = e.target.closest('tr');
        if (fila) fila.remove();
      }
    });
  }
});
