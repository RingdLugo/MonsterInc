const CHANNELS = ['Online', 'Punto Fisico', 'Corporaciones'];
const CHANNEL_MAP = { Online: 'Linea', 'Punto Fisico': 'Fisica', Corporaciones: 'Corporativo' };
const PERMISSIONS = ['Ver tablero', 'Procesar ventas', 'Gestionar clientes', 'Gestionar inventario', 'Emitir CFDI', 'Gestionar envios', 'Gestionar accesos', 'Consultar bitacora', 'Generar cortes'];
const ROLE_PRESETS = {
  Administrador: [...PERMISSIONS],
  Gerente: ['Ver tablero', 'Procesar ventas', 'Gestionar clientes', 'Gestionar inventario', 'Emitir CFDI', 'Gestionar envios', 'Consultar bitacora', 'Generar cortes'],
  Cajero: ['Ver tablero', 'Procesar ventas', 'Gestionar clientes'],
  Vendedor: ['Ver tablero', 'Procesar ventas', 'Gestionar clientes'],
  'Gestor de Inventario': ['Ver tablero', 'Gestionar inventario', 'Consultar bitacora'],
  Almacenista: ['Ver tablero', 'Gestionar inventario', 'Gestionar envios'],
  Facturacion: ['Ver tablero', 'Emitir CFDI', 'Generar cortes', 'Consultar bitacora'],
  Contador: ['Ver tablero', 'Emitir CFDI', 'Generar cortes', 'Consultar bitacora'],
  Logistica: ['Ver tablero', 'Gestionar envios', 'Consultar bitacora']
};
const SCREEN_PERMISSIONS = {
  dashboard: 'Ver tablero',
  pos: 'Procesar ventas',
  clients: 'Gestionar clientes',
  inventory: 'Gestionar inventario',
  billing: 'Emitir CFDI',
  shipping: 'Gestionar envios',
  access: 'Gestionar accesos',
  cut: 'Generar cortes',
  logs: 'Consultar bitacora'
};

const state = {
  screen: 'dashboard',
  stockFilter: 'all',
  clientFilter: 'all',
  invoiceFilter: 'Todos',
  cart: [],
  rolePermissions: {},
  data: {}
};

const money = value => '$' + Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

async function api(action, options = {}) {
  const response = await fetch(`api.php?action=${action}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Operacion no completada.');
  return data;
}

async function loadData() {
  state.data = await api('dashboard_data');
  seedRolePermissions();
  render();
}

function seedRolePermissions() {
  const dbPermissions = {};
  (state.data.rolePermissions || []).forEach(row => {
    const id = Number(row.id_rol);
    if (!dbPermissions[id]) dbPermissions[id] = [];
    dbPermissions[id].push(row.nombre_permiso);
  });
  (state.data.roles || []).forEach(role => {
    const preset = ROLE_PRESETS[role.nombre] || ROLE_PRESETS[normalizeRole(role.nombre)] || ['Ver tablero'];
    if (dbPermissions[Number(role.id)]?.length) state.rolePermissions[role.id] = dbPermissions[Number(role.id)];
    else if (!state.rolePermissions[role.id]) state.rolePermissions[role.id] = [...preset];
  });
}

function normalizeRole(name) {
  const value = String(name || '').toLowerCase();
  if (value.includes('admin')) return 'Administrador';
  if (value.includes('caj')) return 'Cajero';
  if (value.includes('invent') || value.includes('almacen')) return 'Gestor de Inventario';
  if (value.includes('fact') || value.includes('cont')) return 'Facturacion';
  if (value.includes('log') || value.includes('env')) return 'Logistica';
  if (value.includes('ger')) return 'Gerente';
  return name;
}

function currentRole() {
  return document.getElementById('currentRole')?.value || 'Administrador';
}

function rolePermissions(roleName = currentRole()) {
  const role = (state.data.roles || []).find(item => item.nombre === roleName);
  if (role && state.rolePermissions[role.id]) return state.rolePermissions[role.id];
  return ROLE_PRESETS[roleName] || ROLE_PRESETS[normalizeRole(roleName)] || ['Ver tablero'];
}

function can(permission) {
  return rolePermissions().includes(permission);
}

function guard(permission) {
  if (can(permission)) return true;
  alert('Acceso Denegado');
  return false;
}

function branchIdForChannel(channel) {
  if (channel === 'Corporaciones') return 3;
  if (channel === 'Punto Fisico') return 2;
  return 1;
}

function dbChannel(uiChannel) {
  const value = String(uiChannel || '').toLowerCase();
  if (value.includes('online')) return 'Linea';
  if (value.includes('corpor')) return 'Corporativo';
  return CHANNEL_MAP[uiChannel] || 'Fisica';
}

function uiChannel(dbValue) {
  return CHANNELS.find(channel => dbChannel(channel) === dbValue) || 'Punto Fisico';
}

function productStockForChannel(productId, uiChannelName) {
  const branchId = branchIdForChannel(uiChannelName);
  const row = (state.data.inventory || []).find(item => Number(item.id) === Number(productId) && Number(item.id_sucursal) === branchId);
  return Number(row?.stock || 0);
}

function render() {
  renderNavigation();
  renderSelectors();
  renderDashboard();
  renderPOS();
  renderClients();
  renderInventory();
  renderBilling();
  renderShipping();
  renderAccess();
  renderCut();
  renderLogs();
}

function renderNavigation() {
  const screens = [
    ['dashboard', 'Tablero'],
    ['pos', 'Ventas'],
    ['clients', 'Clientes'],
    ['inventory', 'Inventario'],
    ['billing', 'Facturacion'],
    ['shipping', 'Envios'],
    ['access', 'Accesos'],
    ['cut', 'Corte'],
    ['logs', 'Bitacora']
  ];
  if (!can(SCREEN_PERMISSIONS[state.screen])) state.screen = 'dashboard';
  document.getElementById('navigation').innerHTML = screens.map(([id, label]) => {
    const locked = !can(SCREEN_PERMISSIONS[id]);
    return `<button class="nav-button ${state.screen === id ? 'active' : ''} ${locked ? 'locked' : ''}" data-screen="${id}"><span>${label}</span><small>${locked ? 'bloqueado' : 'BD'}</small></button>`;
  }).join('');
  document.querySelectorAll('.screen').forEach(section => section.classList.toggle('active', section.id === state.screen));
  const current = screens.find(([id]) => id === state.screen);
  document.getElementById('screenTitle').textContent = current?.[1] || 'Tablero';
  document.querySelectorAll('[data-screen]').forEach(button => button.onclick = () => {
    const screen = button.dataset.screen;
    if (!guard(SCREEN_PERMISSIONS[screen])) return;
    state.screen = screen;
    render();
  });
}

function renderSelectors() {
  const branches = state.data.branches || [];
  const clients = state.data.clients || [];
  const products = state.data.products || [];
  const roles = state.data.roles || [];
  const roleNames = [...new Set(['Administrador', 'Gerente', 'Cajero', 'Gestor de Inventario', 'Facturacion', 'Logistica', ...roles.map(role => role.nombre)])];

  setOptions('currentRole', roleNames.map(role => [role, role]));
  setOptions('clientBranch', branches.map(branch => [branch.id, branch.nombre]));
  setOptions('employeeBranch', branches.map(branch => [branch.id, branch.nombre]));
  setOptions('employeeRole', roles.map(role => [role.id, role.nombre]));
  setOptions('roleEditor', roles.map(role => [role.id, role.nombre]));
  setOptions('posClient', clients.map(client => [client.id, `${client.nombre} - ${client.tipo}`]));
  setOptions('invoiceClient', clients.map(client => [client.id, client.nombre]));
  setOptions('posProduct', products.map(product => [product.id, `${product.sku} - ${product.nombre}`]));
  renderPermissionChecklist();
}

function setOptions(id, entries) {
  const select = document.getElementById(id);
  if (!select) return;
  const current = select.value;
  select.innerHTML = entries.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
  if (entries.some(([value]) => String(value) === current)) select.value = current;
}

function renderPermissionChecklist() {
  const roleId = Number(document.getElementById('roleEditor')?.value || 0);
  const enabled = state.rolePermissions[roleId] || [];
  document.getElementById('permissionChecklist').innerHTML = PERMISSIONS.map(permission =>
    `<label class="checkitem"><span>${permission}</span><input type="checkbox" value="${esc(permission)}" ${enabled.includes(permission) ? 'checked' : ''}></label>`
  ).join('');
}

function renderDashboard() {
  const sales = state.data.salesByChannel || [];
  const total = sales.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const stock = (state.data.inventory || []).reduce((sum, row) => sum + Number(row.stock || 0), 0);
  document.getElementById('kpiCards').innerHTML = [
    ['Ventas totales', money(total)],
    ['Inventario total', stock],
    ['Clientes', (state.data.clients || []).length],
    ['Envios', (state.data.shipments || []).length]
  ].map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join('');

  drawBars('channelChart', CHANNELS.map(label => {
    const found = sales.find(row => row.canal === dbChannel(label));
    return { label, value: Number(found?.total || 0) };
  }), ['#2364aa', '#078b63', '#7357c8']);

  drawBars('clientChart', CHANNELS.map(label => {
    const db = dbChannel(label);
    return {
      label,
      value: (state.data.clients || []).filter(client => label === 'Corporaciones' ? client.tipo === 'Corporativo' : Number(client[`total_${db.toLowerCase()}`] || 0) > 0).length
    };
  }), ['#2364aa', '#078b63', '#7357c8']);

  drawBars('branchChart', (state.data.salesByRegion || []).map(row => ({ label: row.region, value: Number(row.total || 0) })), ['#1d4ed8', '#0f766e', '#b45309']);
  document.getElementById('recentLogRows').innerHTML = (state.data.logs || []).slice(0, 6).map(log => `<tr><td>${esc(log.fecha)}</td><td>${esc(log.empleado)}</td><td><span class="badge">BD</span></td><td>${esc(log.accion)}</td></tr>`).join('');
}

function drawBars(id, rows, colors) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth || 480;
  const height = canvas.height = Number(canvas.getAttribute('height')) || 220;
  ctx.clearRect(0, 0, width, height);
  const max = Math.max(1, ...rows.map(row => Number(row.value || 0)));
  const gap = 16;
  const barWidth = Math.max(40, (width - gap * (rows.length + 1)) / Math.max(1, rows.length));
  rows.forEach((row, index) => {
    const value = Number(row.value || 0);
    const barHeight = (height - 58) * value / max;
    const x = gap + index * (barWidth + gap);
    const y = height - 34 - barHeight;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#172033';
    ctx.font = '12px Arial';
    ctx.fillText(String(row.label).slice(0, 16), x, height - 12);
    ctx.fillText(value > 999 ? money(value) : String(value), x, Math.max(14, y - 7));
  });
}

function renderPOS() {
  const rows = state.cart.map((item, index) => {
    const product = (state.data.products || []).find(p => Number(p.id) === Number(item.id));
    return `<tr><td>${esc(product?.nombre)}</td><td>${item.cantidad}</td><td>${money(product?.precio)}</td><td>${money((product?.precio || 0) * item.cantidad)}</td><td><button class="ghost" data-remove-cart="${index}">Quitar</button></td></tr>`;
  }).join('');
  document.getElementById('cartRows').innerHTML = rows || '<tr><td colspan="5">Sin articulos en el ticket.</td></tr>';
  document.getElementById('cartTotal').textContent = money(state.cart.reduce((sum, item) => {
    const product = (state.data.products || []).find(p => Number(p.id) === Number(item.id));
    return sum + Number(product?.precio || 0) * item.cantidad;
  }, 0));
  document.getElementById('lastOperation').innerHTML = 'Toda venta crea factura, actualiza inventario, bitacora y graficas.';
  document.querySelectorAll('[data-remove-cart]').forEach(button => button.onclick = () => {
    state.cart.splice(Number(button.dataset.removeCart), 1);
    renderPOS();
  });
}

function addToCart() {
  if (!guard('Procesar ventas')) return;
  const productId = Number(document.getElementById('posProduct').value);
  const quantity = Math.max(1, Number(document.getElementById('posQty').value || 1));
  const channel = 'Punto Fisico';
  if (productStockForChannel(productId, channel) < quantity) return alert('Inventario insuficiente en Punto Fisico.');
  const found = state.cart.find(item => item.id === productId);
  if (found) found.cantidad += quantity;
  else state.cart.push({ id: productId, cantidad: quantity });
  renderPOS();
}

async function processSale(uiChannelName, items = state.cart, clientId = Number(document.getElementById('posClient').value || 0)) {
  if (!guard('Procesar ventas')) return;
  if (!items.length) return alert('Agrega articulos.');
  const data = await api('create_sale', {
    method: 'POST',
    body: JSON.stringify({ canal: dbChannel(uiChannelName), cliente: clientId, items })
  });
  const ticket = buildTicket(data.venta_id, uiChannelName, items, data.total);
  state.cart = [];
  await loadData();
  openDocument(`Ticket venta ${data.venta_id}`, ticket);
}

async function simulateChannelSale(uiChannelName) {
  if (!guard('Procesar ventas')) return;
  const branchId = branchIdForChannel(uiChannelName);
  const product = (state.data.inventory || []).find(row => Number(row.id_sucursal) === branchId && Number(row.stock) > 0);
  if (!product) return alert(`No hay inventario para ${uiChannelName}.`);
  const client = (state.data.clients || []).find(c => uiChannelName === 'Corporaciones' ? c.tipo === 'Corporativo' : true);
  await processSale(uiChannelName, [{ id: Number(product.id), cantidad: uiChannelName === 'Corporaciones' ? 2 : 1 }], Number(client?.id || 0));
}

function buildTicket(saleId, channel, items, total) {
  const rows = items.map(item => {
    const product = (state.data.products || []).find(p => Number(p.id) === Number(item.id));
    return `<tr><td>${esc(product?.nombre)}</td><td>${item.cantidad}</td><td>${money(product?.precio)}</td></tr>`;
  }).join('');
  return `<h3>Monster Inc. Corporation</h3><p>Venta: ${saleId}</p><p>Canal: ${esc(channel)}</p><table><tbody>${rows}</tbody></table><h3>Total: ${money(total)}</h3><p>Impacto aplicado: inventario, facturacion, bitacora y reportes.</p>`;
}

function renderClients() {
  const list = state.clientFilter === 'all' ? state.data.clients || [] : (state.data.clients || []).filter(client => client.tipo === state.clientFilter);
  document.getElementById('clientRows').innerHTML = list.map(client => `<tr><td><strong>${esc(client.nombre)}</strong><br><small>${esc(client.correo)}</small></td><td>${esc(client.tipo)}</td><td><span class="badge">Online ${money(client.total_linea)} / Fisico ${money(client.total_fisica)} / Corp ${money(client.total_corporativo)}</span></td><td>BD central</td><td>${Number(client.total_linea || 0) + Number(client.total_fisica || 0) + Number(client.total_corporativo || 0) > 0 ? 1 : 0}</td><td>${money(Number(client.total_linea || 0) + Number(client.total_fisica || 0) + Number(client.total_corporativo || 0))}</td><td><button class="ghost" data-delete-client="${client.id}">Eliminar</button></td></tr>`).join('');
  document.querySelectorAll('[data-delete-client]').forEach(button => button.onclick = async () => {
    if (!guard('Gestionar clientes')) return;
    if (!confirm('Eliminar cliente sin ventas?')) return;
    try {
      await api('delete_client', { method: 'POST', body: JSON.stringify({ id: Number(button.dataset.deleteClient) }) });
      await loadData();
    } catch (error) {
      alert(error.message);
    }
  });
}

async function createClient() {
  if (!guard('Gestionar clientes')) return;
  await api('create_client', {
    method: 'POST',
    body: JSON.stringify({
      nombre: document.getElementById('clientName').value,
      correo: document.getElementById('clientEmail').value,
      tipo: document.getElementById('clientType').value === 'Cliente Corporativo' ? 'persona_moral' : 'persona_fisica',
      telefono: '',
      direccion: 'Direccion registrada desde ERP'
    })
  });
  await loadData();
}

function renderInventory() {
  const rows = (state.data.inventory || []).filter(row => {
    const stock = Number(row.stock);
    if (state.stockFilter === 'low') return stock > 0 && stock < 10;
    if (state.stockFilter === 'zero') return stock === 0;
    if (state.stockFilter === 'available') return stock > 10;
    return true;
  });
  document.getElementById('inventoryRows').innerHTML = rows.map(row => {
    const product = (state.data.products || []).find(p => Number(p.id) === Number(row.id));
    return `<tr><td><span class="badge">${esc(row.sku)}</span></td><td>${esc(row.nombre)}</td><td>${esc(product?.categoria || 'General')}</td><td>${esc(row.sucursal)}</td><td>${row.stock}</td><td>${money(product?.precio)}</td><td><button class="ghost" data-edit-product="${row.id}" data-branch="${row.id_sucursal}">Ver/Editar</button></td></tr>`;
  }).join('');
  document.querySelectorAll('[data-edit-product]').forEach(button => button.onclick = () => openProductEditor(Number(button.dataset.editProduct), Number(button.dataset.branch)));
}

async function createProduct() {
  if (!guard('Gestionar inventario')) return;
  const name = document.getElementById('productName').value.trim();
  const sku = document.getElementById('productSku').value.trim().toUpperCase();
  const exists = (state.data.products || []).some(product => product.sku.toUpperCase() === sku || product.nombre.toLowerCase() === name.toLowerCase());
  if (exists) return alert('El producto ya existe');
  await api('create_product', {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      sku,
      categoria: document.getElementById('productCategory').value,
      precio: Number(document.getElementById('productPrice').value || 0)
    })
  });
  const qty = Number(document.getElementById('productStock').value || 0);
  if (qty > 0) await api('adjust_stock', { method: 'POST', body: JSON.stringify({ sucursal: 1, sku, cantidad: qty }) });
  await loadData();
}

function openProductEditor(productId, branchId) {
  if (!guard('Gestionar inventario')) return;
  const product = (state.data.products || []).find(item => Number(item.id) === productId);
  const inventory = (state.data.inventory || []).find(item => Number(item.id) === productId && Number(item.id_sucursal) === branchId);
  openDocument('Editar producto', `
    <div class="form-grid">
      <label>Nombre<input id="editProductName" value="${esc(product?.nombre)}"></label>
      <label>Precio base canal online<input id="editProductPrice" type="number" min="1" value="${Number(product?.precio || 0)}"></label>
      <label>Stock en sucursal<input id="editProductStock" type="number" min="0" value="${Number(inventory?.stock || 0)}"></label>
    </div>
    <button id="saveProductEdit">Guardar cambios</button>
  `);
  document.getElementById('saveProductEdit').onclick = async () => {
    await api('update_product', {
      method: 'POST',
      body: JSON.stringify({
        id: productId,
        sucursal: branchId,
        nombre: document.getElementById('editProductName').value,
        precio: Number(document.getElementById('editProductPrice').value || 0),
        stock: Number(document.getElementById('editProductStock').value || 0)
      })
    });
    document.getElementById('modal').classList.remove('open');
    await loadData();
  };
}

function renderBilling() {
  calculateInvoicePreview();
  const query = (document.getElementById('invoiceSearch')?.value || '').toLowerCase();
  const filter = document.getElementById('invoiceFilter')?.value || 'Todos';
  const invoices = (state.data.invoices || []).filter(invoice => {
    const text = `${invoice.id} ${invoice.cliente || ''} ${invoice.rfc || ''}`.toLowerCase();
    const channel = uiChannel(invoice.canal);
    return text.includes(query) && (filter === 'Todos' || dbChannel(filter) === invoice.canal || filter === channel);
  });
  document.getElementById('invoiceRows').innerHTML = invoices.map(invoice => `<tr><td>FAC-${String(invoice.id).padStart(4, '0')}</td><td>${esc(invoice.cliente || invoice.rfc || 'Cliente')}</td><td><span class="badge">${esc(uiChannel(invoice.canal))}</span></td><td>${money(invoice.total)}</td><td><span class="status ok">Emitida</span></td><td><button class="ghost" data-open-invoice="${invoice.id}">PDF/XML</button></td></tr>`).join('');
  document.querySelectorAll('[data-open-invoice]').forEach(button => button.onclick = () => downloadInvoice(Number(button.dataset.openInvoice)));
}

function calculateInvoicePreview() {
  const amount = Number(document.getElementById('invoiceAmount')?.value || 0);
  const tax = amount * 0.16;
  if (document.getElementById('invoiceSubtotal')) document.getElementById('invoiceSubtotal').textContent = money(amount);
  if (document.getElementById('invoiceTax')) document.getElementById('invoiceTax').textContent = money(tax);
  if (document.getElementById('invoiceTotal')) document.getElementById('invoiceTotal').textContent = money(amount + tax);
}

async function issueInvoice() {
  if (!guard('Emitir CFDI')) return;
  const data = await api('create_manual_invoice', {
    method: 'POST',
    body: JSON.stringify({
      cliente: Number(document.getElementById('invoiceClient').value || 0),
      canal: dbChannel(document.getElementById('invoiceChannel').value),
      importe: Number(document.getElementById('invoiceAmount').value || 0)
    })
  });
  await loadData();
  openDocument(`CFDI ${data.venta_id}`, `<p>CFDI emitido y registrado en FACTURA.</p><p>Total: ${money(data.total)}</p>`);
}

function downloadInvoice(invoiceId) {
  const invoice = (state.data.invoices || []).find(item => Number(item.id) === invoiceId);
  if (!invoice) return alert('Factura no encontrada.');
  const folio = `FAC-${String(invoice.id).padStart(4, '0')}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<cfdi folio="${folio}" cliente="${esc(invoice.cliente)}" rfc="${esc(invoice.rfc || 'XAXX010101000')}" canal="${esc(invoice.canal)}" total="${Number(invoice.total || 0).toFixed(2)}" uso_cfdi="${esc(invoice.uso_cfdi || 'G03')}"></cfdi>`;
  const pdf = `Monster Inc. Corporation\n${folio}\nCliente: ${invoice.cliente}\nRFC: ${invoice.rfc || 'XAXX010101000'}\nCanal: ${uiChannel(invoice.canal)}\nTotal: ${money(invoice.total)}\nCFDI simulado para entorno local.`;
  download(`${folio}.xml`, xml, 'application/xml;charset=utf-8');
  download(`${folio}.pdf`, pdf, 'application/pdf');
  openDocument(folio, `<p>Se descargaron los archivos simulados PDF y XML.</p><p>Total: ${money(invoice.total)}</p>`);
}

function renderShipping() {
  document.getElementById('shipmentRows').innerHTML = (state.data.shipments || []).map(shipment => `<tr><td>${esc(shipment.numero_guia || `ENV-${shipment.id}`)}</td><td><span class="badge">Online/Corp</span></td><td>Venta ${shipment.id_venta}</td><td>BD central</td><td>${esc(shipment.direccion)}</td><td><select data-shipment="${shipment.id}"><option ${shipment.estado === 'Preparando' ? 'selected' : ''}>Preparando</option><option ${shipment.estado === 'En camino' ? 'selected' : ''}>En camino</option><option ${shipment.estado === 'Entregado' ? 'selected' : ''}>Entregado</option><option ${shipment.estado === 'Fallido' ? 'selected' : ''}>Fallido</option></select></td><td><button class="ghost" data-view-shipment="${shipment.id}">Ver</button></td></tr>`).join('');
  document.querySelectorAll('[data-shipment]').forEach(select => select.onchange = async () => {
    if (!guard('Gestionar envios')) {
      await loadData();
      return;
    }
    await api('update_shipment', { method: 'POST', body: JSON.stringify({ id: Number(select.dataset.shipment), estado: select.value }) });
    await loadData();
  });
  document.querySelectorAll('[data-view-shipment]').forEach(button => button.onclick = () => openDocument(`Envio ${button.dataset.viewShipment}`, '<p>Envio/recoleccion conectado a ENVIO y ESTADO_ENVIO.</p>'));
}

function renderAccess() {
  document.getElementById('employeeRows').innerHTML = (state.data.employees || []).map(employee => {
    const active = Number(employee.activo) === 1;
    return `<tr><td>${esc(employee.nombre)}</td><td>${esc(employee.correo)}</td><td>${esc(employee.rol)}</td><td>${esc(employee.sucursal || '-')}</td><td><span class="status ${active ? 'ok' : 'bad'}">${active ? 'Activo' : 'Inactivo'}</span></td><td><button class="ghost" data-employee="${employee.id}">${active ? 'Desactivar' : 'Activar'}</button></td></tr>`;
  }).join('');
  document.querySelectorAll('[data-employee]').forEach(button => button.onclick = async () => {
    if (!guard('Gestionar accesos')) return;
    await api('toggle_employee', { method: 'POST', body: JSON.stringify({ id: Number(button.dataset.employee) }) });
    await loadData();
  });
}

async function createEmployee() {
  if (!guard('Gestionar accesos')) return;
  await api('create_employee', {
    method: 'POST',
    body: JSON.stringify({
      nombre: document.getElementById('employeeName').value,
      correo: document.getElementById('employeeEmail').value,
      password: 'Empleado123*',
      rol: Number(document.getElementById('employeeRole').value || 0),
      sucursal: Number(document.getElementById('employeeBranch').value || 1)
    })
  });
  await loadData();
}

function selectedCutSales() {
  const period = document.getElementById('cutPeriod')?.value || 'Semanal';
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  if (period === 'Mensual') start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'Personalizado') {
    start = document.getElementById('cutStart').value ? new Date(document.getElementById('cutStart').value) : new Date(0);
    end = document.getElementById('cutEnd').value ? new Date(document.getElementById('cutEnd').value) : now;
  } else {
    start.setDate(now.getDate() - 7);
  }
  end.setHours(23, 59, 59, 999);
  return (state.data.sales || []).filter(sale => {
    const date = new Date(String(sale.fecha_hora).replace(' ', 'T'));
    return date >= start && date <= end;
  });
}

function renderCut() {
  const selected = selectedCutSales();
  const rows = CHANNELS.map(channel => {
    const sales = selected.filter(sale => sale.canal === dbChannel(channel));
    const total = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    return { channel, count: sales.length, total, subtotal: total / 1.16, tax: total - total / 1.16 };
  });
  document.getElementById('cutCards').innerHTML = rows.map(row => `<div class="kpi"><span>${row.channel}</span><strong>${money(row.total)}</strong></div>`).join('');
  document.getElementById('cutRows').innerHTML = rows.map(row => `<tr><td>${row.channel}</td><td>${row.count}</td><td>${money(row.subtotal)}</td><td>${money(row.tax)}</td><td>${money(row.total)}</td></tr>`).join('');
}

function renderLogs() {
  document.getElementById('logRows').innerHTML = (state.data.logs || []).map(log => {
    const action = String(log.accion || '');
    const channel = action.includes('Linea') ? 'Online' : action.includes('Fisica') ? 'Punto Fisico' : action.includes('Corporativo') ? 'Corporaciones' : 'General';
    return `<tr><td>${esc(log.fecha)}</td><td>${esc(log.empleado)}</td><td><span class="badge">${channel}</span></td><td>Operacion</td><td>${esc(action)}</td><td>Registrado en BITACORA</td></tr>`;
  }).join('');
}

function openDocument(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `<div class="doc">${html}</div>`;
  document.getElementById('modal').classList.add('open');
}

function download(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function csv(rows) {
  return rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
}

function exportAll() {
  download('monsterinc-reporte.csv', csv([
    ['tipo', 'dato', 'valor'],
    ['ventas', 'canales', JSON.stringify(state.data.salesByChannel || [])],
    ['inventario', 'registros', (state.data.inventory || []).length],
    ['clientes', 'registros', (state.data.clients || []).length]
  ]));
}

function exportTable(name, rows) {
  download(`${name}.csv`, csv(rows));
}

function wire() {
  document.getElementById('addToCart').onclick = addToCart;
  document.getElementById('clearCart').onclick = () => { state.cart = []; renderPOS(); };
  document.getElementById('processPosSale').onclick = () => processSale('Punto Fisico');
  document.getElementById('runOnlineOrder').onclick = () => simulateChannelSale('Online');
  document.getElementById('runCorporateOrder').onclick = () => simulateChannelSale('Corporaciones');
  document.getElementById('simulateOnline').onclick = () => simulateChannelSale('Online');
  document.getElementById('simulateCorporate').onclick = () => simulateChannelSale('Corporaciones');
  document.getElementById('createClient').onclick = createClient;
  document.getElementById('createProduct').onclick = createProduct;
  document.getElementById('createEmployee').onclick = createEmployee;
  document.getElementById('issueInvoice').onclick = issueInvoice;
  document.getElementById('invoiceAmount').oninput = calculateInvoicePreview;
  document.getElementById('invoiceSearch').oninput = renderBilling;
  document.getElementById('invoiceFilter').onchange = renderBilling;
  document.getElementById('processCut').onclick = () => { if (guard('Generar cortes')) renderCut(); };
  document.getElementById('exportAll').onclick = exportAll;
  document.getElementById('exportClients').onclick = () => exportTable('clientes', [['nombre', 'tipo', 'correo'], ...(state.data.clients || []).map(c => [c.nombre, c.tipo, c.correo])]);
  document.getElementById('exportInventory').onclick = () => exportTable('inventario', [['sku', 'producto', 'sucursal', 'stock'], ...(state.data.inventory || []).map(i => [i.sku, i.nombre, i.sucursal, i.stock])]);
  document.getElementById('exportInvoices').onclick = () => exportTable('facturas', [['id', 'venta', 'canal', 'total'], ...(state.data.invoices || []).map(i => [i.id, i.id_venta, i.canal, i.total])]);
  document.getElementById('exportShipments').onclick = () => exportTable('envios', [['id', 'venta', 'estado'], ...(state.data.shipments || []).map(s => [s.id, s.id_venta, s.estado])]);
  document.getElementById('exportEmployees').onclick = () => exportTable('empleados', [['nombre', 'correo', 'rol', 'activo'], ...(state.data.employees || []).map(e => [e.nombre, e.correo, e.rol, e.activo])]);
  document.getElementById('exportLogs').onclick = () => exportTable('bitacora', [['fecha', 'empleado', 'accion'], ...(state.data.logs || []).map(l => [l.fecha, l.empleado, l.accion])]);
  document.getElementById('downloadCut').onclick = () => exportTable('corte-canales', [['canal', 'ventas', 'total'], ...CHANNELS.map(channel => {
    const row = selectedCutSales().filter(sale => sale.canal === dbChannel(channel));
    return [channel, row.length, row.reduce((sum, sale) => sum + Number(sale.total || 0), 0)];
  })]);
  document.querySelectorAll('[data-stock-filter]').forEach(button => button.onclick = () => { state.stockFilter = button.dataset.stockFilter; renderInventory(); });
  document.querySelectorAll('[data-filter-client]').forEach(button => button.onclick = () => { state.clientFilter = button.dataset.filterClient === 'Cliente Corporativo' ? 'Corporativo' : button.dataset.filterClient === 'Cliente Individual' ? 'Individual' : 'all'; renderClients(); });
  document.getElementById('closeModal').onclick = () => document.getElementById('modal').classList.remove('open');
  document.getElementById('printModal').onclick = () => window.print();
  document.getElementById('downloadModal').onclick = () => download('documento-monsterinc.html', document.getElementById('modalBody').innerHTML, 'text/html;charset=utf-8');
  document.querySelectorAll('[data-export]').forEach(button => button.onclick = () => exportAll());
  document.getElementById('resetState').onclick = async () => { await loadData(); openDocument('Datos recargados', '<p>El ERP volvio a leer el estado global desde sistema_ventas.</p>'); };
  document.getElementById('saveRoleChanges').onclick = saveRolePermissions;
  document.getElementById('createRole').onclick = createRole;
  document.getElementById('roleEditor').onchange = renderPermissionChecklist;
  document.getElementById('currentRole').onchange = () => render();
}

async function createRole() {
  if (!guard('Gestionar accesos')) return;
  const name = document.getElementById('newRoleName').value.trim();
  if (!name) return alert('Captura el nombre del rol.');
  const checked = [...document.querySelectorAll('#permissionChecklist input:checked')].map(input => input.value);
  const created = await api('create_role', { method: 'POST', body: JSON.stringify({ nombre: name }) });
  state.rolePermissions[created.id] = checked.length ? checked : ['Ver tablero'];
  await api('save_role_permissions', { method: 'POST', body: JSON.stringify({ rol: created.id, permisos: state.rolePermissions[created.id] }) });
  await loadData();
}

async function saveRolePermissions() {
  if (!guard('Gestionar accesos')) return;
  const roleId = Number(document.getElementById('roleEditor').value || 0);
  const permissions = [...document.querySelectorAll('#permissionChecklist input:checked')].map(input => input.value);
  state.rolePermissions[roleId] = permissions;
  await api('save_role_permissions', { method: 'POST', body: JSON.stringify({ rol: roleId, permisos: permissions }) });
  await loadData();
  openDocument('Permisos guardados', '<p>Permisos registrados en PERMISO y ROL_PERMISO. El selector de rol aplica la simulacion de privilegios en la interfaz.</p>');
}

document.addEventListener('DOMContentLoaded', async () => {
  wire();
  await loadData();
});
