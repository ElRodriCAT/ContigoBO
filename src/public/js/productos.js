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
document.addEventListener('DOMContentLoaded', async () => {
  const tabla = document.getElementById('tabla-productos');
  try {
    const res = await fetch('/productos');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const productos = await res.json();
    productos.forEach(producto => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${producto.id}</td>
        <td>${producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>${producto.stock}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (err) {
    tabla.innerHTML = `<tr><td colspan="4">Error al cargar productos: ${err.message}</td></tr>`;
  }
});
