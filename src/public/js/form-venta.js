document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-venta');
  if (form) {
    form.addEventListener('submit', function(e) {
      const total = Number(form.total.value);
      const createdAt = form.createdAt.value;
      if (!createdAt || isNaN(total) || total < 0) {
        alert('Todos los campos son requeridos y los valores numéricos no pueden ser negativos.');
        e.preventDefault();
      }
    });
  }
});
