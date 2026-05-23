let state = {
  productos: [],
  clientes: [],
  empleados: [],
  roles: [],
  sucursales: [],
  inventario: [],
  ventasCanal: [],
  ventasRegion: [],
  envios: [],
  facturas: [],
  bitacora: [],
  carrito: []
};

async function apiRequest(action, options = {}) {
  const response = await fetch(`api.php?action=${action}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'No fue posible completar la operacion.');
  return data;
}

const money = value => '$' + Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

async function cargarDatosBackend() {
  try {
    const data = await apiRequest('dashboard_data');
    state.productos = data.products || [];
    state.clientes = data.clients || [];
    state.empleados = data.employees || [];
    state.roles = data.roles || [];
    state.sucursales = data.branches || [];
    state.inventario = data.inventory || [];
    state.ventasCanal = data.salesByChannel || [];
    state.ventasRegion = data.salesByRegion || [];
    state.envios = data.shipments || [];
    state.facturas = data.invoices || [];
    state.bitacora = data.logs || [];

    prepararSelects();
    renderizarTodo();
  } catch (error) {
    alert(`Error al cargar datos del ERP: ${error.message}`);
  }
}

function prepararSelects() {
  const sucursalVenta = document.getElementById('sucursalVenta');
  if (sucursalVenta) {
    sucursalVenta.innerHTML = state.sucursales.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  }

  const clienteVenta = document.getElementById('clienteVenta');
  if (clienteVenta) {
    clienteVenta.innerHTML = '<option value="">Publico en general</option>' + state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)} - ${esc(c.tipo)}</option>`).join('');
  }

  const filtroSucursal = document.getElementById('filtroSucursal');
  if (filtroSucursal) {
    filtroSucursal.innerHTML = '<option value="">Todas las sucursales</option>' + state.sucursales.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
    filtroSucursal.onchange = renderizarInventario;
  }
}

async function iniciarSesion(event) {
  event.preventDefault();
  try {
    const data = await apiRequest('login', {
      method: 'POST',
      body: JSON.stringify({
        correo: document.getElementById('login-correo').value,
        password: document.getElementById('login-pass').value
      })
    });

    document.querySelector('.nombre-user').textContent = `${data.empleado.nombre} - ${data.empleado.rol}`;
    document.querySelector('.correo-user').textContent = `Sucursal: ${data.empleado.sucursal}`;
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
  if (idSeccion === 'sec-pos') renderizarGraficas();
}

function cambiarTab(idTab, botonPresionado) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('activa'));
  document.getElementById(idTab).classList.add('activa');
  document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('tab-activo'));
  botonPresionado.classList.add('tab-activo');
}

function renderizarTodo() {
  renderizarGraficas();
  renderizarTablaProductos();
  renderizarTablaClientes();
  renderizarInventario();
  renderizarEnvios();
  renderizarFacturas();
  renderizarPersonal();
  renderizarRoles();
  renderizarBitacora();
  renderizarCarrito();
}

function ensureCharts() {
  const section = document.getElementById('sec-pos');
  if (!section || document.getElementById('erpCharts')) return;
  const box = document.createElement('div');
  box.id = 'erpCharts';
  box.className = 'grid-2-col';
  box.style.marginBottom = '18px';
  box.innerHTML = `
    <div class="card">
      <h2>Ventas por Canal</h2>
      <canvas id="chartCanales" height="180"></canvas>
    </div>
    <div class="card">
      <h2>Desempeno por Region</h2>
      <canvas id="chartRegiones" height="180"></canvas>
    </div>`;
  section.insertBefore(box, section.children[1] || null);
}

function drawBarChart(canvasId, rows, labelKey, valueKey, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth || 420;
  const height = canvas.height = Number(canvas.getAttribute('height')) || 180;
  ctx.clearRect(0, 0, width, height);
  const max = Math.max(1, ...rows.map(r => Number(r[valueKey] || 0)));
  const gap = 18;
  const barWidth = Math.max(34, (width - gap * (rows.length + 1)) / Math.max(1, rows.length));
  rows.forEach((row, index) => {
    const value = Number(row[valueKey] || 0);
    const barHeight = (height - 55) * value / max;
    const x = gap + index * (barWidth + gap);
    const y = height - 35 - barHeight;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.fillText(String(row[labelKey]).slice(0, 14), x, height - 14);
    ctx.fillText(valueKey === 'total' ? money(value) : String(value), x, Math.max(14, y - 6));
  });
}

function renderizarGraficas() {
  ensureCharts();
  const channels = ['Linea', 'Fisica', 'Corporativo'].map(canal => {
    const found = state.ventasCanal.find(row => row.canal === canal);
    return { canal, total: Number(found?.total || 0), ventas: Number(found?.ventas || 0) };
  });
  drawBarChart('chartCanales', channels, 'canal', 'total', ['#2563eb', '#10b981', '#f59e0b']);
  drawBarChart('chartRegiones', state.ventasRegion, 'region', 'total', ['#7c3aed', '#0891b2', '#dc2626']);
}

function agregarProductoVenta() {
  const sku = document.getElementById('skuBusqueda').value.trim().toUpperCase();
  const producto = state.productos.find(p => p.sku.toUpperCase() === sku);
  if (!producto) return alert('SKU no encontrado.');
  if (Number(producto.stock) <= 0) return alert('No hay inventario disponible.');
  const item = state.carrito.find(i => i.id === producto.id);
  if (item) item.cantidad++;
  else state.carrito.push({ ...producto, cantidad: 1 });
  document.getElementById('skuBusqueda').value = '';
  renderizarCarrito();
}

function renderizarCarrito() {
  const tbody = document.getElementById('tablaCarrito');
  if (!tbody) return;
  if (state.carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">Sin productos agregados</td></tr>';
    const subtotal = document.getElementById('resumenSubtotal');
    const total = document.getElementById('resumenTotal');
    if (subtotal) subtotal.textContent = '$0.00';
    if (total) total.textContent = '$0.00';
    return;
  }
  tbody.innerHTML = state.carrito.map((item, index) => `
    <tr>
      <td>${esc(item.nombre)}</td>
      <td><button class="btn-sm btn-gray" onclick="cambiarCantidad(${index}, -1)">-</button> ${item.cantidad} <button class="btn-sm" onclick="cambiarCantidad(${index}, 1)">+</button></td>
      <td>${money(item.precio)}</td>
      <td>${money(item.precio * item.cantidad)}</td>
    </tr>`).join('');
  const subtotal = state.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  document.getElementById('resumenSubtotal').textContent = money(subtotal);
  document.getElementById('resumenDescuento').textContent = '-$0.00';
  document.getElementById('resumenTotal').textContent = money(subtotal);
}

function cambiarCantidad(index, delta) {
  state.carrito[index].cantidad += delta;
  if (state.carrito[index].cantidad <= 0) state.carrito.splice(index, 1);
  renderizarCarrito();
}

async function procesarVenta() {
  if (!state.carrito.length) return alert('Agrega al menos un producto.');
  try {
    const canal = mapCanal(document.getElementById('canalVenta')?.value || 'Fisica');
    const data = await apiRequest('create_sale', {
      method: 'POST',
      body: JSON.stringify({
        canal,
        cliente: Number(document.getElementById('clienteVenta')?.value || 0),
        items: state.carrito.map(item => ({ id: item.id, cantidad: item.cantidad }))
      })
    });
    alert(`Venta procesada.\nVenta #${data.venta_id}\nTotal: ${money(data.total)}`);
    state.carrito = [];
    await cargarDatosBackend();
  } catch (error) {
    alert(`Error al procesar venta: ${error.message}`);
  }
}

function mapCanal(value) {
  const normalized = String(value).toLowerCase();
  if (normalized.includes('online') || normalized.includes('linea')) return 'Linea';
  if (normalized.includes('corporativo')) return 'Corporativo';
  return 'Fisica';
}

async function registrarProducto(event) {
  event.preventDefault();
  try {
    await apiRequest('create_product', {
      method: 'POST',
      body: JSON.stringify({
        nombre: document.getElementById('nombreProducto').value,
        sku: document.getElementById('skuProducto').value,
        precio: Number(document.getElementById('precioProducto').value),
        categoria: document.getElementById('categoriaProducto').value
      })
    });
    event.target.reset();
    await cargarDatosBackend();
    alert('Producto registrado.');
  } catch (error) {
    alert(error.message);
  }
}

function renderizarTablaProductos(list = state.productos) {
  const tbody = document.getElementById('tablaProductos');
  if (!tbody) return;
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><span class="badge-sku">${esc(p.sku)}</span></td>
      <td>${esc(p.nombre)}</td>
      <td>${money(p.precio)}</td>
      <td><span class="tag">${esc(p.categoria)}</span></td>
      <td><button class="btn-sm btn-gray" onclick="alert('Producto conectado a PRECIO_CANAL e INVENTARIO')">Ver</button></td>
    </tr>`).join('') || '<tr><td colspan="5">No hay productos.</td></tr>';
}

function filtrarProductos() {
  const q = document.getElementById('buscarProducto').value.toLowerCase();
  renderizarTablaProductos(state.productos.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
}

async function registrarCliente(event) {
  event.preventDefault();
  try {
    await apiRequest('create_client', {
      method: 'POST',
      body: JSON.stringify({
        tipo: document.getElementById('tipoCliente').value,
        nombre: document.getElementById('nombreCliente').value,
        rfc: document.getElementById('rfcCliente').value,
        correo: document.getElementById('correoCliente').value,
        telefono: document.getElementById('telefonoCliente').value,
        direccion: document.getElementById('direccionCliente').value,
        ciudad: document.getElementById('ciudadCliente').value,
        estado: document.getElementById('estadoCliente').value,
        cp: document.getElementById('cpCliente').value
      })
    });
    event.target.reset();
    await cargarDatosBackend();
    alert('Cliente registrado.');
  } catch (error) {
    alert(error.message);
  }
}

async function eliminarCliente(id) {
  if (!confirm('Eliminar cliente sin ventas asociadas?')) return;
  try {
    await apiRequest('delete_client', { method: 'POST', body: JSON.stringify({ id }) });
    await cargarDatosBackend();
  } catch (error) {
    alert(error.message);
  }
}

function renderizarTablaClientes(list = state.clientes) {
  const tbody = document.getElementById('tablaClientes');
  if (!tbody) return;
  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong>${esc(c.nombre)}</strong><div style="font-size:11px;color:#64748b">Linea ${money(c.total_linea)} | Fisica ${money(c.total_fisica)} | Corp ${money(c.total_corporativo)}</div></td>
      <td><span class="mono">${esc(c.rfc || '-')}</span></td>
      <td><span class="tag ${c.tipo === 'Corporativo' ? 'tag-purple' : 'tag-blue'}">${esc(c.tipo)}</span></td>
      <td>${esc(c.correo || '-')}</td>
      <td><button class="btn-sm btn-gray" onclick="eliminarCliente(${c.id})">Eliminar</button></td>
    </tr>`).join('') || '<tr><td colspan="5">No hay clientes.</td></tr>';
}

function filtrarClientes(q) {
  const query = q.toLowerCase();
  renderizarTablaClientes(state.clientes.filter(c => c.nombre.toLowerCase().includes(query) || (c.rfc || '').toLowerCase().includes(query) || (c.correo || '').toLowerCase().includes(query)));
}

function renderizarInventario() {
  const tbody = document.getElementById('tablaInventario');
  if (!tbody) return;
  const filter = document.getElementById('filtroSucursal')?.value;
  const rows = state.inventario.filter(i => !filter || String(i.id_sucursal) === filter);
  tbody.innerHTML = rows.map(i => {
    const stock = Number(i.stock);
    const status = stock <= 0 ? ['status-danger', 'Agotado'] : stock < 10 ? ['status-warn', 'Bajo'] : ['status-ok', 'OK'];
    return `<tr>
      <td><span class="badge-sku">${esc(i.sku)}</span></td>
      <td>${esc(i.nombre)}</td>
      <td>${esc(i.sucursal)}</td>
      <td><strong>${stock}</strong></td>
      <td><span class="status-badge ${status[0]}">${status[1]}</span></td>
      <td><button class="btn-sm btn-gray" onclick="abrirModalAjusteStock('${esc(i.sku)}', ${i.id_sucursal})">Ajustar</button></td>
    </tr>`;
  }).join('');
  const values = document.querySelectorAll('#sec-inventario .stat-value');
  if (values[0]) values[0].textContent = state.productos.length;
  if (values[1]) values[1].textContent = state.inventario.filter(i => Number(i.stock) > 0 && Number(i.stock) < 10).length;
  if (values[2]) values[2].textContent = state.inventario.filter(i => Number(i.stock) <= 0).length;
  if (values[3]) values[3].textContent = state.inventario.filter(i => Number(i.stock) > 0).length;
}

function abrirModalAjusteStock(sku = '', sucursal = 1) {
  const modal = document.getElementById('modalAjusteStock');
  modal.style.display = 'flex';
  const selects = modal.querySelectorAll('select');
  const inputs = modal.querySelectorAll('input');
  if (selects[0]) selects[0].innerHTML = state.sucursales.map(s => `<option value="${s.id}" ${Number(s.id) === Number(sucursal) ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('');
  if (inputs[0]) inputs[0].value = sku;
  if (inputs[1]) inputs[1].value = '';
  const save = modal.querySelector('button');
  save.onclick = guardarAjusteStock;
}

async function guardarAjusteStock() {
  const modal = document.getElementById('modalAjusteStock');
  const selects = modal.querySelectorAll('select');
  const inputs = modal.querySelectorAll('input');
  try {
    await apiRequest('adjust_stock', { method: 'POST', body: JSON.stringify({ sucursal: Number(selects[0].value), sku: inputs[0].value, cantidad: Number(inputs[1].value) }) });
    cerrarModal('modalAjusteStock');
    await cargarDatosBackend();
  } catch (error) {
    alert(error.message);
  }
}

function renderizarEnvios() {
  const tbody = document.getElementById('tablaEnvios');
  if (!tbody) return;
  tbody.innerHTML = state.envios.map(e => `<tr>
    <td><span class="mono">#ENV-${e.id}</span></td>
    <td>#VTA-${e.id_venta}</td>
    <td>${esc(e.direccion)}</td>
    <td><span class="mono">${esc(e.numero_guia || '-')}</span></td>
    <td>${esc(e.fecha_estimada_entrega || '-')}</td>
    <td><span class="status-badge status-warn">${esc(e.estado)}</span></td>
    <td><button class="btn-sm" onclick="abrirModalEnvio('ENV-${e.id}')">Ver</button></td>
  </tr>`).join('') || '<tr><td colspan="7">No hay envios registrados. Se generan cuando existan direcciones y ventas en linea.</td></tr>';
}

function abrirModalEnvio(id) {
  document.getElementById('modalEnvioId').textContent = `#${id}`;
  document.getElementById('modalDetalleEnvio').style.display = 'flex';
}

function renderizarFacturas() {
  const tbody = document.getElementById('tablaFacturas');
  if (!tbody) return;
  tbody.innerHTML = state.facturas.map(f => `<tr>
    <td><span class="mono">FAC-${String(f.id).padStart(4, '0')}</span></td>
    <td><span class="mono">${esc(f.rfc || '-')}</span></td>
    <td>${esc(f.fecha_emision)}</td>
    <td>${money(f.total)}</td>
    <td><span class="status-badge status-ok">Timbrada</span></td>
    <td><button class="btn-sm btn-gray">Ver</button></td>
  </tr>`).join('') || '<tr><td colspan="6">No hay facturas emitidas.</td></tr>';
}

function generarCFDI() {
  const rfc = document.getElementById('rfcFactura').value;
  if (!rfc) return alert('Ingresa el RFC del cliente.');
  alert(`CFDI preparado para RFC ${rfc.toUpperCase()}. La tabla FACTURA esta lista para timbrado real.`);
}

function renderizarPersonal() {
  const tbody = document.querySelector('#tab-empleados table tbody');
  if (!tbody) return;
  tbody.innerHTML = state.empleados.map(e => `<tr>
    <td><strong>${esc(e.nombre)}</strong><small style="display:block;color:#94a3b8">${esc(e.correo)}</small></td>
    <td><span class="tag">${esc(e.rol)}</span></td>
    <td>${esc(e.sucursal || '-')}</td>
    <td><span class="status-badge ${Number(e.activo) ? 'status-ok' : 'status-danger'}">${Number(e.activo) ? 'Activo' : 'Inactivo'}</span></td>
    <td><button class="btn-sm btn-gray" onclick="eliminarEmpleado(${e.id})">Desactivar</button></td>
  </tr>`).join('');
  prepararFormularioEmpleado();
}

function prepararFormularioEmpleado() {
  const form = document.querySelector('#tab-empleados form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';
  const roleSelect = form.querySelectorAll('select')[0];
  const branchSelect = form.querySelectorAll('select')[1];
  roleSelect.innerHTML = state.roles.map(r => `<option value="${r.id}">${esc(r.nombre)}</option>`).join('');
  branchSelect.innerHTML = state.sucursales.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  form.onsubmit = registrarEmpleado;
}

async function registrarEmpleado(event) {
  event.preventDefault();
  const form = event.target;
  const inputs = form.querySelectorAll('input');
  const selects = form.querySelectorAll('select');
  try {
    await apiRequest('create_employee', {
      method: 'POST',
      body: JSON.stringify({ nombre: inputs[0].value, correo: inputs[1].value, password: inputs[2].value, rol: Number(selects[0].value), sucursal: Number(selects[1].value) })
    });
    form.reset();
    await cargarDatosBackend();
  } catch (error) {
    alert(error.message);
  }
}

async function eliminarEmpleado(id) {
  if (!confirm('Desactivar empleado?')) return;
  await apiRequest('delete_employee', { method: 'POST', body: JSON.stringify({ id }) });
  await cargarDatosBackend();
}

function renderizarRoles() {
  const tbody = document.querySelector('#tab-roles table tbody');
  if (!tbody) return;
  tbody.innerHTML = state.roles.map(r => `<tr><td><span class="mono">ROL-${r.id}</span></td><td><strong>${esc(r.nombre)}</strong></td><td><span class="tag">Permisos operativos</span></td><td><button class="btn-sm btn-gray" onclick="alert('Rol conectado a ROL y ROL_PERMISO')">Ver</button></td></tr>`).join('');
}

function renderizarBitacora() {
  const tbody = document.getElementById('tablaBitacora');
  if (!tbody) return;
  tbody.innerHTML = state.bitacora.map(log => `<tr>
    <td><span class="mono" style="font-size:12px">${esc(log.fecha)}</span></td>
    <td>${esc(log.empleado)}</td>
    <td><span class="tag">${esc((log.accion || '').split(':')[0])}</span></td>
    <td>${esc(log.accion)}</td>
    <td style="font-size:12px;color:#64748b">Registrado en tabla BITACORA</td>
  </tr>`).join('') || '<tr><td colspan="5">Sin movimientos.</td></tr>';
  document.querySelectorAll('#sec-bitacora .paginacion button, #sec-bitacora .btn-sm').forEach(button => {
    if (button.textContent.toLowerCase().includes('exportar')) button.onclick = exportarBitacora;
  });
}

function exportarBitacora() {
  const csv = ['fecha,empleado,accion', ...state.bitacora.map(log => `"${log.fecha}","${log.empleado}","${log.accion}"`)].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bitacora-monsterinc.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function cerrarModal(idModal) {
  document.getElementById(idModal).style.display = 'none';
}

document.addEventListener('click', event => {
  if (event.target.classList.contains('modal-overlay')) event.target.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', cargarDatosBackend);
