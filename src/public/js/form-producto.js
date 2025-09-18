document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-producto');
  if (form) {
    form.addEventListener('submit', function(e) {
      const nombre = form.nombre.value.trim();
      const precio = Number(form.precio.value);
      const stock = Number(form.stock.value);
      if (!nombre || isNaN(precio) || isNaN(stock) || precio < 0 || stock < 0) {
        alert('Todos los campos son requeridos y los valores numéricos no pueden ser negativos.');
        e.preventDefault();
      }
    });
  }
});
