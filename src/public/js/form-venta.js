document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-venta');
  const agregarDetalleBtn = document.getElementById('agregar-detalle');
  const detallesContainer = document.getElementById('detalles-container');
  const noDetalles = document.getElementById('no-detalles');
  const btnCrearVenta = document.getElementById('btn-crear-venta');
  const totalInput = document.querySelector('input[name="total"]');
  
  let contadorDetalles = 0;

  // Obtener productos del servidor (se pasarán desde la vista)
  const productos = window.productos || [];

  agregarDetalleBtn.addEventListener('click', function() {
    // Verificar si hay un detalle incompleto antes de agregar otro
    if (hayDetalleIncompleto()) {
      alert('Por favor complete el producto actual antes de agregar otro.');
      return;
    }
    agregarDetalle();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const detalles = obtenerDetalles();
    if (detalles.length === 0) {
      alert('Debe agregar al menos un producto a la venta.');
      return;
    }

    // Agregar los detalles al formulario
    detalles.forEach((detalle, index) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = `detalles[${index}][productoId]`;
      input.value = detalle.productoId;
      form.appendChild(input);

      const inputCantidad = document.createElement('input');
      inputCantidad.type = 'hidden';
      inputCantidad.name = `detalles[${index}][cantidad]`;
      inputCantidad.value = detalle.cantidad;
      form.appendChild(inputCantidad);

      const inputPrecio = document.createElement('input');
      inputPrecio.type = 'hidden';
      inputPrecio.name = `detalles[${index}][precio]`;
      inputPrecio.value = detalle.precio;
      form.appendChild(inputPrecio);
    });

    // Enviar el formulario
    form.submit();
  });

  function hayDetalleIncompleto() {
    const detalleItems = document.querySelectorAll('.detalle-item');
    
    for (let item of detalleItems) {
      const productoId = item.querySelector('.producto-select').value;
      const cantidad = item.querySelector('.cantidad-input').value;
      const precio = item.querySelector('.precio-input').value;
      
      // Si hay algún campo vacío, el detalle está incompleto
      if (!productoId || !cantidad || !precio || cantidad <= 0 || precio <= 0) {
        return true;
      }
    }
    
    return false;
  }

  function agregarDetalle() {
    contadorDetalles++;
    
    const detalleDiv = document.createElement('div');
    detalleDiv.className = 'detalle-item';
    detalleDiv.id = `detalle-${contadorDetalles}`;
    
    detalleDiv.innerHTML = `
      <div class="mb-2">
        <label class="form-label">Producto</label>
        <select class="producto-select form-select" required>
          <option value="">Seleccionar producto...</option>
          ${productos.map(p => `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} - $${p.precio}</option>`).join('')}
        </select>
      </div>
      <div class="mb-2">
        <label class="form-label">Cantidad</label>
        <input type="number" class="cantidad-input form-control" placeholder="Cantidad" min="1" step="1" required>
      </div>
      <div class="mb-2">
        <label class="form-label">Precio unitario</label>
        <input type="number" class="precio-input form-control" placeholder="Precio unitario" min="0" step="0.01" required>
      </div>
      <div class="d-grid gap-2 mb-2">
        <button type="button" class="eliminar-detalle btn btn-warning">
          Eliminar
        </button>
      </div>
    `;
    
    detallesContainer.appendChild(detalleDiv);
    
    // Agregar event listeners
    const productoSelect = detalleDiv.querySelector('.producto-select');
    const cantidadInput = detalleDiv.querySelector('.cantidad-input');
    const precioInput = detalleDiv.querySelector('.precio-input');
    const eliminarBtn = detalleDiv.querySelector('.eliminar-detalle');
    
    productoSelect.addEventListener('change', function() {
      const option = this.options[this.selectedIndex];
      if (option.value) {
        precioInput.value = option.dataset.precio;
        calcularTotal();
        actualizarEstadoBotones();
      }
    });
    
    cantidadInput.addEventListener('input', function() {
      calcularTotal();
      actualizarEstadoBotones();
    });
    
    precioInput.addEventListener('input', function() {
      calcularTotal();
      actualizarEstadoBotones();
    });
    
    eliminarBtn.addEventListener('click', function() {
      detalleDiv.remove();
      calcularTotal();
      actualizarEstadoFormulario();
      actualizarEstadoBotones();
    });
    
    actualizarEstadoFormulario();
    actualizarEstadoBotones();
  }

  function obtenerDetalles() {
    const detalles = [];
    const detalleItems = document.querySelectorAll('.detalle-item');
    
    detalleItems.forEach(item => {
      const productoId = item.querySelector('.producto-select').value;
      const cantidad = item.querySelector('.cantidad-input').value;
      const precio = item.querySelector('.precio-input').value;
      
      if (productoId && cantidad && precio) {
        detalles.push({
          productoId: productoId,
          cantidad: cantidad,
          precio: precio
        });
      }
    });
    
    return detalles;
  }

  function calcularTotal() {
    let total = 0;
    const detalleItems = document.querySelectorAll('.detalle-item');
    
    detalleItems.forEach(item => {
      const cantidad = parseFloat(item.querySelector('.cantidad-input').value) || 0;
      const precio = parseFloat(item.querySelector('.precio-input').value) || 0;
      total += cantidad * precio;
    });
    
    totalInput.value = total.toFixed(2);
  }

  function actualizarEstadoBotones() {
    // Deshabilitar botón "Agregar Producto" si hay detalles incompletos
    const tieneIncompletos = hayDetalleIncompleto();
    agregarDetalleBtn.disabled = tieneIncompletos;
    
    if (tieneIncompletos) {
      agregarDetalleBtn.innerHTML = 'Complete el producto actual';
      // Cambiar apariencia del botón cuando esté deshabilitado
    } else {
      agregarDetalleBtn.innerHTML = 'Agregar Producto';
      // Restaurar apariencia normal del botón
    }
    
    // Habilitar/deshabilitar botón de crear venta
    const hayDetalles = document.querySelectorAll('.detalle-item').length > 0;
    const todosCompletos = !tieneIncompletos && hayDetalles;
    btnCrearVenta.disabled = !todosCompletos;
  }

  function actualizarEstadoFormulario() {
    const hayDetalles = document.querySelectorAll('.detalle-item').length > 0;
    
    if (hayDetalles) {
      noDetalles.style.display = 'none';
    } else {
      noDetalles.style.display = 'block';
      totalInput.value = '';
    }
    
    actualizarEstadoBotones();
  }
});