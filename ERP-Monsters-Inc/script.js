let productos = [];
let clientes = [];
let carrito = [];

async function apiRequest(action, options = {}) {
  const response = await fetch(`api.php?action=${action}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'No fue posible completar la operacion.');
  }

  return data;
}

async function cargarDatosBackend() {
  try {
    const data = await apiRequest('initial_data');
    productos = data.productos || [];
    clientes = data.clientes || [];
    renderizarTablaProductos();
    renderizarTablaClientes();
    renderizarCarrito();
  } catch (error) {
    alert(`Error al cargar datos del ERP: ${error.message}`);
  }
}

async function iniciarSesion(event) {
  event.preventDefault();
  const correo = document.getElementById('login-correo').value;
  const pass = document.getElementById('login-pass').value;

  try {
    const data = await apiRequest('login', {
      method: 'POST',
      body: JSON.stringify({ correo, password: pass })
    });

    const nombreUser = document.querySelector('.nombre-user');
    const correoUser = document.querySelector('.correo-user');

    if (nombreUser) {
      nombreUser.textContent = `${data.empleado.nombre} - ${data.empleado.rol}`;
    }

    if (correoUser) {
      correoUser.textContent = `Sucursal: ${data.empleado.sucursal}`;
    }

    document.getElementById('pantalla-login').style.display = 'none';
    document.getElementById('app-dashboard').style.display = 'flex';
    await cargarDatosBackend();
  } catch (error) {
    alert(`No se pudo iniciar sesion: ${error.message}`);
  }
}

function cerrarSesion() {
  document.getElementById('app-dashboard').style.display = 'none';
  document.getElementById('pantalla-login').style.display = 'flex';
  document.getElementById('login-correo').value = '';
  document.getElementById('login-pass').value = '';
}

function mostrarSeccion(idSeccion, botonPresionado) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
  document.getElementById(idSeccion).classList.add('activa');
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('activo'));
  botonPresionado.classList.add('activo');
}

function cambiarTab(idTab, botonPresionado) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('activa'));
  document.getElementById(idTab).classList.add('activa');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-activo'));
  botonPresionado.classList.add('tab-activo');
}

function agregarProductoVenta() {
  const sku = document.getElementById('skuBusqueda').value.trim().toUpperCase();
  if (!sku) {
    alert('Ingresa un codigo SKU.');
    return;
  }

  const producto = productos.find(p => p.sku.toUpperCase() === sku);
  if (!producto) {
    alert(`No se encontro el producto con SKU: ${sku}`);
    return;
  }

  if (producto.stock <= 0) {
    alert('El producto no tiene inventario disponible.');
    return;
  }

  const existente = carrito.find(item => item.sku === producto.sku);
  if (existente) {
    if (existente.cantidad >= producto.stock) {
      alert('No hay inventario suficiente para agregar mas unidades.');
      return;
    }
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  document.getElementById('skuBusqueda').value = '';
  renderizarCarrito();
}

function renderizarCarrito() {
  const tbody = document.getElementById('tablaCarrito');
  if (!tbody) return;

  if (carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">Sin productos agregados</td></tr>';
    document.getElementById('resumenSubtotal').textContent = '$0.00';
    document.getElementById('resumenTotal').textContent = '$0.00';
    return;
  }

  tbody.innerHTML = carrito.map((item, idx) => `
    <tr>
      <td>${item.nombre}</td>
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <button onclick="cambiarCantidad(${idx}, -1)" style="width:24px; height:24px; padding:0; font-size:14px; background:#f1f5f9; color:#334155; border-radius:4px;">-</button>
          ${item.cantidad}
          <button onclick="cambiarCantidad(${idx}, 1)" style="width:24px; height:24px; padding:0; font-size:14px; background:#f1f5f9; color:#334155; border-radius:4px;">+</button>
        </div>
      </td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  document.getElementById('resumenSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('resumenDescuento').textContent = '-$0.00';
  document.getElementById('resumenTotal').textContent = `$${subtotal.toFixed(2)}`;
}

function cambiarCantidad(idx, delta) {
  const nuevaCantidad = carrito[idx].cantidad + delta;
  if (nuevaCantidad <= 0) {
    carrito.splice(idx, 1);
  } else if (nuevaCantidad <= carrito[idx].stock) {
    carrito[idx].cantidad = nuevaCantidad;
  } else {
    alert('No hay inventario suficiente.');
  }
  renderizarCarrito();
}

async function procesarVenta() {
  if (carrito.length === 0) {
    alert('Agrega al menos un producto.');
    return;
  }

  try {
    const canal = document.getElementById('canalVenta')?.value || 'Fisica';
    const data = await apiRequest('create_sale', {
      method: 'POST',
      body: JSON.stringify({
        canal,
        items: carrito.map(item => ({
          id: item.id,
          cantidad: item.cantidad
        }))
      })
    });

    alert(`Venta procesada correctamente.\nVenta #${data.venta_id}\nTotal cobrado: $${Number(data.total).toFixed(2)}`);
    carrito = [];
    await cargarDatosBackend();
  } catch (error) {
    alert(`Error al procesar venta: ${error.message}`);
  }
}

async function registrarProducto(event) {
  event.preventDefault();

  const nombre = document.getElementById('nombreProducto').value;
  const sku = document.getElementById('skuProducto').value.toUpperCase();
  const precio = parseFloat(document.getElementById('precioProducto').value);
  const categoria = document.getElementById('categoriaProducto').value;

  if (productos.find(p => p.sku === sku)) {
    alert('Ya existe un producto con ese SKU.');
    return;
  }

  try {
    await apiRequest('create_product', {
      method: 'POST',
      body: JSON.stringify({ nombre, sku, precio, categoria })
    });

    event.target.reset();
    await cargarDatosBackend();
    alert('Producto registrado correctamente.');
  } catch (error) {
    alert(`Error al registrar producto: ${error.message}`);
  }
}

function renderizarTablaProductos() {
  const tbody = document.getElementById('tablaProductos');
  if (!tbody) return;

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay productos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td><span class="badge-sku">${p.sku}</span></td>
      <td>${p.nombre}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td><span class="tag">${p.categoria}</span></td>
      <td><button class="btn-sm btn-gray">Editar</button></td>
    </tr>
  `).join('');
}

function filtrarProductos() {
  const q = document.getElementById('buscarProducto').value.toLowerCase();
  const tbody = document.getElementById('tablaProductos');
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  );

  tbody.innerHTML = filtrados.map(p => `
    <tr>
      <td><span class="badge-sku">${p.sku}</span></td>
      <td>${p.nombre}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td><span class="tag">${p.categoria}</span></td>
      <td><button class="btn-sm btn-gray">Editar</button></td>
    </tr>
  `).join('');
}

function registrarCliente(event) {
  event.preventDefault();
  alert('El alta de clientes se conserva en la tienda; el ERP consulta clientes desde sistema_ventas.');
}

function renderizarTablaClientes() {
  const tbody = document.getElementById('tablaClientes');
  if (!tbody) return;

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay clientes registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = clientes.map(c => `
    <tr>
      <td><strong>${c.nombre}</strong></td>
      <td><span class="mono">${c.rfc || '-'}</span></td>
      <td><span class="tag ${c.tipo === 'Corporativo' ? 'tag-purple' : 'tag-blue'}">${c.tipo}</span></td>
      <td>${c.correo || '-'}</td>
      <td>
        <button class="btn-sm btn-gray">Ver</button>
        <button class="btn-sm btn-gray">Editar</button>
      </td>
    </tr>
  `).join('');
}

function filtrarClientes(q) {
  const tbody = document.getElementById('tablaClientes');
  const query = q.toLowerCase();
  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(query) ||
    (c.rfc && c.rfc.toLowerCase().includes(query)) ||
    (c.correo && c.correo.toLowerCase().includes(query))
  );

  tbody.innerHTML = filtrados.map(c => `
    <tr>
      <td><strong>${c.nombre}</strong></td>
      <td><span class="mono">${c.rfc || '-'}</span></td>
      <td><span class="tag ${c.tipo === 'Corporativo' ? 'tag-purple' : 'tag-blue'}">${c.tipo}</span></td>
      <td>${c.correo || '-'}</td>
      <td>
        <button class="btn-sm btn-gray">Ver</button>
        <button class="btn-sm btn-gray">Editar</button>
      </td>
    </tr>
  `).join('');
}

function abrirModalAjusteStock() {
  document.getElementById('modalAjusteStock').style.display = 'flex';
}

function abrirModalEnvio(id) {
  document.getElementById('modalEnvioId').textContent = `#${id}`;
  document.getElementById('modalDetalleEnvio').style.display = 'flex';
}

function generarCFDI() {
  const rfc = document.getElementById('rfcFactura').value;
  if (!rfc) {
    alert('Ingresa el RFC del cliente.');
    return;
  }
  alert(`CFDI preparado para RFC: ${rfc.toUpperCase()}`);
}

function cerrarModal(idModal) {
  document.getElementById(idModal).style.display = 'none';
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  cargarDatosBackend();
});
