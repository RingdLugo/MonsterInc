const CHANNELS = ['Online', 'Punto Físico', 'Corporaciones'];
const PERMISSIONS = [
  ['dashboard', 'Ver tablero'],
  ['pos', 'Procesar despachos'],
  ['clients', 'Gestionar clientes'],
  ['inventory', 'Gestionar inventario'],
  ['billing', 'Emitir CFDI'],
  ['shipping', 'Gestionar envíos'],
  ['access', 'Administrar accesos'],
  ['cut', 'Generar cortes'],
  ['logs', 'Consultar bitácora']
];

const initialState = () => ({
  currentRole: 'Administrador',
  currentUser: 'James P. Sullivan',
  activeScreen: 'dashboard',
  stockFilter: 'all',
  clientFilter: 'all',
  invoiceFilter: 'Todos',
  cutResult: null,
  roles: {
    Administrador: PERMISSIONS.map(p => p[0]),
    Cajero: ['dashboard', 'pos', 'clients', 'billing', 'logs'],
    'Gestor de Inventario': ['dashboard', 'inventory', 'shipping', 'logs'],
    Facturación: ['dashboard', 'billing', 'cut', 'logs'],
    Logística: ['dashboard', 'shipping', 'inventory', 'logs']
  },
  branches: [
    { id: 'B01', name: 'Planta Susto Matriz', type: 'Punto Físico' },
    { id: 'B02', name: 'Sucursal Susto Norte', type: 'Punto Físico' },
    { id: 'B03', name: 'Centro de Recargas Online', type: 'Online' },
    { id: 'B04', name: 'Atención Corporativa Monstrópolis', type: 'Corporaciones' }
  ],
  employees: [
    { id: 'E001', name: 'James P. Sullivan', email: 'sulley@monsters.inc', role: 'Administrador', branch: 'Planta Susto Matriz', active: true },
    { id: 'E002', name: 'Mike Wazowski', email: 'mike@monsters.inc', role: 'Cajero', branch: 'Planta Susto Matriz', active: true },
    { id: 'E003', name: 'Celia Mae', email: 'celia@monsters.inc', role: 'Facturación', branch: 'Centro de Recargas Online', active: true },
    { id: 'E004', name: 'Roz Okonkwo', email: 'roz@monsters.inc', role: 'Gestor de Inventario', branch: 'Sucursal Susto Norte', active: true },
    { id: 'E005', name: 'Randall Boggs', email: 'randall@monsters.inc', role: 'Logística', branch: 'Atención Corporativa Monstrópolis', active: false },
    { id: 'E006', name: 'Henry Waternoose', email: 'waternoose@monsters.inc', role: 'Administrador', branch: 'Atención Corporativa Monstrópolis', active: true }
  ],
  clients: [
    { id: 'C001', name: 'Boo Thompson', email: 'boo@humanmail.com', type: 'Cliente Individual', channel: 'Online', branch: 'Centro de Recargas Online', purchases: 4, total: 18400 },
    { id: 'C002', name: 'Familia Rivera', email: 'rivera@humanmail.com', type: 'Cliente Individual', channel: 'Online', branch: 'Centro de Recargas Online', purchases: 2, total: 7200 },
    { id: 'C003', name: 'Tienda Monstruo Centro', email: 'compras@tmc.mon', type: 'Cliente Corporativo', channel: 'Corporaciones', branch: 'Atención Corporativa Monstrópolis', purchases: 6, total: 168000 },
    { id: 'C004', name: 'Universidad del Susto', email: 'energia@us.mon', type: 'Cliente Corporativo', channel: 'Corporaciones', branch: 'Atención Corporativa Monstrópolis', purchases: 3, total: 126000 },
    { id: 'C005', name: 'George Sanderson', email: 'george@monsters.inc', type: 'Cliente Individual', channel: 'Punto Físico', branch: 'Planta Susto Matriz', purchases: 5, total: 23500 },
    { id: 'C006', name: 'Fungus Labs', email: 'suministros@fungus.mon', type: 'Cliente Corporativo', channel: 'Corporaciones', branch: 'Atención Corporativa Monstrópolis', purchases: 1, total: 54000 },
    { id: 'C007', name: 'Abuelita Terror', email: 'terror@humanmail.com', type: 'Cliente Individual', channel: 'Punto Físico', branch: 'Sucursal Susto Norte', purchases: 3, total: 9800 },
    { id: 'C008', name: 'Hotel Transylvania MX', email: 'compras@transylvania.mon', type: 'Cliente Corporativo', channel: 'Online', branch: 'Centro de Recargas Online', purchases: 2, total: 62000 }
  ],
  products: [
    { id: 'P001', sku: 'MI-GR-100', name: 'Tanque de gritos 100L', category: 'Energía de gritos', branch: 'Planta Susto Matriz', stock: 28, price: 1500 },
    { id: 'P002', sku: 'MI-GR-500', name: 'Tanque de gritos industrial 500L', category: 'Energía de gritos', branch: 'Atención Corporativa Monstrópolis', stock: 9, price: 6800 },
    { id: 'P003', sku: 'MI-RS-100', name: 'Tanque de risas 100L', category: 'Energía de risas', branch: 'Centro de Recargas Online', stock: 35, price: 2100 },
    { id: 'P004', sku: 'MI-RS-XL', name: 'Tanque de risas XL', category: 'Energía de risas', branch: 'Planta Susto Matriz', stock: 6, price: 4300 },
    { id: 'P005', sku: 'MI-VAL-01', name: 'Válvula CDA segura', category: 'Accesorios', branch: 'Sucursal Susto Norte', stock: 18, price: 420 },
    { id: 'P006', sku: 'MI-KIT-01', name: 'Kit de recarga doméstica', category: 'Recargas Online', branch: 'Centro de Recargas Online', stock: 0, price: 1250 },
    { id: 'P007', sku: 'MI-B2B-10', name: 'Paquete corporativo 10 tanques', category: 'Corporativo', branch: 'Atención Corporativa Monstrópolis', stock: 14, price: 56000 },
    { id: 'P008', sku: 'MI-MED-01', name: 'Medidor de energía de risas', category: 'Medición', branch: 'Sucursal Susto Norte', stock: 22, price: 890 },
    { id: 'P009', sku: 'MI-PUR-77', name: 'Purificador anti-contaminación CDA', category: 'Seguridad', branch: 'Planta Susto Matriz', stock: 11, price: 1750 },
    { id: 'P010', sku: 'MI-REC-24', name: 'Recarga nocturna programada', category: 'Servicio', branch: 'Centro de Recargas Online', stock: 60, price: 980 }
  ],
  sales: [
    { id: 'S001', date: daysAgo(6), channel: 'Online', clientId: 'C001', branch: 'Centro de Recargas Online', total: 4200, tax: 579.31, items: [{ productId: 'P003', qty: 2, price: 2100 }] },
    { id: 'S002', date: daysAgo(5), channel: 'Punto Físico', clientId: 'C005', branch: 'Planta Susto Matriz', total: 3000, tax: 413.79, items: [{ productId: 'P001', qty: 2, price: 1500 }] },
    { id: 'S003', date: daysAgo(4), channel: 'Corporaciones', clientId: 'C003', branch: 'Atención Corporativa Monstrópolis', total: 112000, tax: 15448.28, items: [{ productId: 'P007', qty: 2, price: 56000 }] },
    { id: 'S004', date: daysAgo(3), channel: 'Online', clientId: 'C008', branch: 'Centro de Recargas Online', total: 12500, tax: 1724.14, items: [{ productId: 'P006', qty: 10, price: 1250 }] },
    { id: 'S005', date: daysAgo(2), channel: 'Punto Físico', clientId: 'C007', branch: 'Sucursal Susto Norte', total: 2670, tax: 368.28, items: [{ productId: 'P008', qty: 3, price: 890 }] },
    { id: 'S006', date: daysAgo(1), channel: 'Corporaciones', clientId: 'C004', branch: 'Atención Corporativa Monstrópolis', total: 68000, tax: 9379.31, items: [{ productId: 'P002', qty: 10, price: 6800 }] }
  ],
  invoices: [
    { id: 'F001', saleId: 'S001', clientId: 'C001', channel: 'Online', concept: 'Recarga de energía de risas', subtotal: 3620.69, tax: 579.31, total: 4200, status: 'Emitida', date: daysAgo(6) },
    { id: 'F002', saleId: 'S002', clientId: 'C005', channel: 'Punto Físico', concept: 'Despacho de energía en mostrador', subtotal: 2586.21, tax: 413.79, total: 3000, status: 'Emitida', date: daysAgo(5) },
    { id: 'F003', saleId: 'S003', clientId: 'C003', channel: 'Corporaciones', concept: 'Contrato industrial de energía', subtotal: 96551.72, tax: 15448.28, total: 112000, status: 'Emitida', date: daysAgo(4) },
    { id: 'F004', saleId: 'S004', clientId: 'C008', channel: 'Online', concept: 'Recarga programada', subtotal: 10775.86, tax: 1724.14, total: 12500, status: 'Pendiente XML', date: daysAgo(3) },
    { id: 'F005', saleId: 'S006', clientId: 'C004', channel: 'Corporaciones', concept: 'Suministro B2B Monstrópolis', subtotal: 58620.69, tax: 9379.31, total: 68000, status: 'Emitida', date: daysAgo(1) }
  ],
  shipments: [
    { id: 'ENV001', saleId: 'S001', channel: 'Online', clientId: 'C001', branch: 'Centro de Recargas Online', destination: 'Habitación humana asignada 23-B', status: 'En Ruta', eta: futureDays(1) },
    { id: 'ENV002', saleId: 'S004', channel: 'Online', clientId: 'C008', branch: 'Centro de Recargas Online', destination: 'Hotel Transylvania MX, almacén 4', status: 'Pendiente', eta: futureDays(2) },
    { id: 'ENV003', saleId: 'S003', channel: 'Corporaciones', clientId: 'C003', branch: 'Atención Corporativa Monstrópolis', destination: 'Distrito Industrial de Monstrópolis', status: 'Entregado', eta: daysAgo(2) },
    { id: 'ENV004', saleId: 'S006', channel: 'Corporaciones', clientId: 'C004', branch: 'Atención Corporativa Monstrópolis', destination: 'Campus Universidad del Susto', status: 'En Ruta', eta: futureDays(3) }
  ],
  logs: [
    logSeed('Sistema', 'General', 'Inicialización', 'Carga inicial del ERP de energía Monsters Inc.'),
    logSeed('Administrador', 'Online', 'Venta importada', 'Pedido web inicial asignado al Centro de Recargas Online.'),
    logSeed('Administrador', 'Corporaciones', 'Contrato activo', 'Contrato B2B registrado para Tienda Monstruo Centro.'),
    logSeed('Gestor de Inventario', 'Punto Físico', 'Inventario auditado', 'Conteo inicial en Planta Susto Matriz completado.'),
    logSeed('Facturación', 'Corporaciones', 'CFDI emitido', 'Factura fiscal de energía F003 creada.')
  ],
  cart: [],
  lastDocument: ''
});

let state = loadState();

const screens = [
  ['dashboard', 'Tablero'],
  ['pos', 'POS Energía'],
  ['clients', 'Clientes'],
  ['inventory', 'Inventario'],
  ['billing', 'Facturación'],
  ['shipping', 'Envíos'],
  ['access', 'Accesos'],
  ['cut', 'Corte'],
  ['logs', 'Bitácora']
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function futureDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function nowStamp() {
  return new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' });
}

function logSeed(role, channel, action, detail) {
  return { id: crypto.randomUUID(), date: nowStamp(), role, channel, module: action.split(' ')[0], action, detail };
}

function loadState() {
  const raw = localStorage.getItem('monsters-erp-state-v3');
  return raw ? JSON.parse(raw) : initialState();
}

function saveState() {
  localStorage.setItem('monsters-erp-state-v3', JSON.stringify(state));
}

function setState(mutator) {
  mutator(state);
  saveState();
  render();
}

function money(v) {
  return '$' + Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function byId(list, id) {
  return list.find(x => x.id === id);
}

function addLog(channel, module, action, detail) {
  state.logs.unshift({ id: crypto.randomUUID(), date: nowStamp(), role: state.currentRole, channel, module, action, detail });
}

function can(permission) {
  return (state.roles[state.currentRole] || []).includes(permission);
}

function requirePermission(permission) {
  if (can(permission)) return true;
  alert(`Acceso Denegado: el rol "${state.currentRole}" no tiene permiso para esta acción.`);
  addLog('General', 'Seguridad', 'Acceso denegado', `Intento de usar permiso ${permission}`);
  setState(s => s);
  return false;
}

function render() {
  renderNavigation();
  renderRoleSelectors();
  renderKpis();
  renderCharts();
  renderPOS();
  renderClients();
  renderInventory();
  renderBilling();
  renderShipping();
  renderAccess();
  renderCut();
  renderLogs();
  bindDynamicButtons();
}

function renderNavigation() {
  const nav = document.getElementById('navigation');
  nav.innerHTML = screens.map(([id, label]) => `<button class="nav-button ${state.activeScreen === id ? 'active' : ''}" data-screen="${id}"><span>${label}</span><small>${can(id) ? 'OK' : 'Bloq.'}</small></button>`).join('');
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === state.activeScreen));
  const current = screens.find(s => s[0] === state.activeScreen);
  document.getElementById('screenTitle').textContent = current ? current[1] : 'Tablero';
}

function renderRoleSelectors() {
  const roles = Object.keys(state.roles);
  document.getElementById('currentRole').innerHTML = roles.map(r => `<option ${r === state.currentRole ? 'selected' : ''}>${r}</option>`).join('');
  document.getElementById('employeeRole').innerHTML = roles.map(r => `<option>${r}</option>`).join('');
  document.getElementById('roleEditor').innerHTML = roles.map(r => `<option ${r === state.currentRole ? 'selected' : ''}>${r}</option>`).join('');
  document.getElementById('employeeBranch').innerHTML = state.branches.map(b => `<option>${b.name}</option>`).join('');
  document.getElementById('clientBranch').innerHTML = state.branches.map(b => `<option>${b.name}</option>`).join('');
  document.getElementById('posClient').innerHTML = state.clients.map(c => `<option value="${c.id}">${c.name} - ${c.channel}</option>`).join('');
  document.getElementById('invoiceClient').innerHTML = state.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('posProduct').innerHTML = state.products.filter(p => p.stock > 0).map(p => `<option value="${p.id}">${p.sku} - ${p.name} (${p.stock})</option>`).join('');
  const selectedRole = document.getElementById('roleEditor').value || state.currentRole;
  document.getElementById('permissionChecklist').innerHTML = PERMISSIONS.map(([key, label]) => `<label class="checkitem"><span>${label}</span><input type="checkbox" data-permission="${key}" ${(state.roles[selectedRole] || []).includes(key) ? 'checked' : ''}></label>`).join('');
}

function renderKpis() {
  const totalSales = state.sales.reduce((s, x) => s + x.total, 0);
  const totalStock = state.products.reduce((s, x) => s + x.stock, 0);
  const pendingShipments = state.shipments.filter(s => s.status !== 'Entregado').length;
  document.getElementById('kpiCards').innerHTML = [
    ['Energía vendida', money(totalSales)],
    ['Inventario tanques', totalStock],
    ['Clientes activos', state.clients.length],
    ['Envíos pendientes', pendingShipments]
  ].map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function chartRowsByChannel() {
  return CHANNELS.map(channel => ({
    label: channel,
    value: state.sales.filter(s => s.channel === channel).reduce((sum, s) => sum + s.total, 0)
  }));
}

function renderCharts() {
  drawBars('channelChart', chartRowsByChannel(), ['#2364aa', '#078b63', '#7357c8']);
  drawBars('clientChart', CHANNELS.map(c => ({ label: c, value: state.clients.filter(x => x.channel === c).length })), ['#2364aa', '#078b63', '#7357c8']);
  drawBars('branchChart', state.branches.map(b => ({ label: b.name.replace('Monstrópolis', 'Corp.'), value: state.clients.filter(c => c.branch === b.name).length })), ['#1d4ed8', '#0f766e', '#b45309', '#7c3aed']);
  document.getElementById('recentLogRows').innerHTML = state.logs.slice(0, 6).map(l => `<tr><td>${l.date}</td><td>${l.role}</td><td><span class="badge">${l.channel}</span></td><td>${l.action}</td></tr>`).join('');
}

function drawBars(id, rows, colors) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth || 480;
  const height = canvas.height = Number(canvas.getAttribute('height')) || 220;
  ctx.clearRect(0, 0, width, height);
  const max = Math.max(1, ...rows.map(r => Number(r.value)));
  const gap = 16;
  const bar = Math.max(34, (width - gap * (rows.length + 1)) / rows.length);
  rows.forEach((r, i) => {
    const h = (height - 58) * Number(r.value) / max;
    const x = gap + i * (bar + gap);
    const y = height - 34 - h;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y, bar, h);
    ctx.fillStyle = '#172033';
    ctx.font = '12px Arial';
    ctx.fillText(String(r.label).slice(0, 16), x, height - 12);
    ctx.fillText(Number(r.value) > 999 ? money(r.value) : String(r.value), x, Math.max(14, y - 7));
  });
}

function renderPOS() {
  const rows = state.cart.map(item => {
    const product = byId(state.products, item.productId);
    return `<tr><td>${product.name}</td><td>${item.qty}</td><td>${money(product.price)}</td><td>${money(item.qty * product.price)}</td><td><button class="ghost" data-remove-cart="${item.productId}">Quitar</button></td></tr>`;
  }).join('');
  document.getElementById('cartRows').innerHTML = rows || '<tr><td colspan="5">Sin conceptos en el ticket.</td></tr>';
  document.getElementById('cartTotal').textContent = money(state.cart.reduce((sum, item) => sum + item.qty * byId(state.products, item.productId).price, 0));
  document.getElementById('lastOperation').innerHTML = state.lastDocument || 'La última operación aparecerá aquí con su ticket o CFDI.';
}

function renderClients() {
  const filtered = state.clientFilter === 'all' ? state.clients : state.clients.filter(c => c.type === state.clientFilter);
  document.getElementById('clientRows').innerHTML = filtered.map(c => `<tr><td><strong>${c.name}</strong><br><small>${c.email}</small></td><td>${c.type}</td><td><span class="badge">${c.channel}</span></td><td>${c.branch}</td><td>${c.purchases}</td><td>${money(c.total)}</td><td><button class="ghost" data-delete-client="${c.id}">Eliminar</button></td></tr>`).join('');
}

function renderInventory() {
  const filtered = state.products.filter(p => {
    if (state.stockFilter === 'low') return p.stock > 0 && p.stock < 10;
    if (state.stockFilter === 'zero') return p.stock === 0;
    if (state.stockFilter === 'available') return p.stock > 10;
    return true;
  });
  document.getElementById('inventoryRows').innerHTML = filtered.map(p => `<tr><td><span class="badge">${p.sku}</span></td><td>${p.name}</td><td>${p.category}</td><td>${p.branch}</td><td>${p.stock}</td><td>${money(p.price)}</td><td><button class="ghost" data-edit-product="${p.id}">Ver/Editar</button></td></tr>`).join('');
}

function renderBilling() {
  calculateInvoicePreview();
  const query = document.getElementById('invoiceSearch')?.value?.toLowerCase() || '';
  const channel = state.invoiceFilter;
  const rows = state.invoices.filter(f => {
    const client = byId(state.clients, f.clientId);
    const matchText = f.id.toLowerCase().includes(query) || client.name.toLowerCase().includes(query);
    const matchChannel = channel === 'Todos' || f.channel === channel;
    return matchText && matchChannel;
  });
  document.getElementById('invoiceRows').innerHTML = rows.map(f => {
    const client = byId(state.clients, f.clientId);
    return `<tr><td>${f.id}</td><td>${client.name}</td><td><span class="badge">${f.channel}</span></td><td>${money(f.total)}</td><td><span class="status ok">${f.status}</span></td><td><button class="ghost" data-download-cfdi="${f.id}">PDF/XML</button></td></tr>`;
  }).join('');
}

function renderShipping() {
  document.getElementById('shipmentRows').innerHTML = state.shipments.map(s => {
    const client = byId(state.clients, s.clientId);
    return `<tr><td>${s.id}</td><td><span class="badge">${s.channel}</span></td><td>${client.name}</td><td>${s.branch}</td><td>${s.destination}</td><td><select data-shipment-status="${s.id}"><option ${s.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option><option ${s.status === 'En Ruta' ? 'selected' : ''}>En Ruta</option><option ${s.status === 'Entregado' ? 'selected' : ''}>Entregado</option></select></td><td><button class="ghost" data-view-shipment="${s.id}">Ver</button></td></tr>`;
  }).join('');
}

function renderAccess() {
  document.getElementById('employeeRows').innerHTML = state.employees.map(e => `<tr><td>${e.name}</td><td>${e.email}</td><td>${e.role}</td><td>${e.branch}</td><td><span class="status ${e.active ? 'ok' : 'bad'}">${e.active ? 'Activo' : 'Inactivo'}</span></td><td><button class="ghost" data-toggle-employee="${e.id}">${e.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('');
}

function renderCut() {
  const result = state.cutResult || calculateCut();
  document.getElementById('cutCards').innerHTML = CHANNELS.map(c => `<div class="kpi"><span>${c}</span><strong>${money(result[c]?.total || 0)}</strong></div>`).join('');
  document.getElementById('cutRows').innerHTML = CHANNELS.map(c => {
    const row = result[c] || { count: 0, subtotal: 0, tax: 0, total: 0 };
    return `<tr><td>${c}</td><td>${row.count}</td><td>${money(row.subtotal)}</td><td>${money(row.tax)}</td><td>${money(row.total)}</td></tr>`;
  }).join('');
}

function renderLogs() {
  document.getElementById('logRows').innerHTML = state.logs.map(l => `<tr><td>${l.date}</td><td>${l.role}</td><td><span class="badge">${l.channel}</span></td><td>${l.module}</td><td>${l.action}</td><td>${l.detail}</td></tr>`).join('');
}

function calculateInvoicePreview() {
  const amount = Number(document.getElementById('invoiceAmount')?.value || 0);
  const tax = amount * .16;
  const total = amount + tax;
  const sub = document.getElementById('invoiceSubtotal');
  if (!sub) return;
  sub.textContent = money(amount);
  document.getElementById('invoiceTax').textContent = money(tax);
  document.getElementById('invoiceTotal').textContent = money(total);
}

function processSale(channel, clientId, items, branch) {
  let total = 0;
  items.forEach(item => {
    const product = byId(state.products, item.productId);
    if (!product || product.stock < item.qty) throw new Error(`Stock insuficiente para ${product?.name || item.productId}`);
    total += product.price * item.qty;
  });
  items.forEach(item => byId(state.products, item.productId).stock -= item.qty);
  const sale = { id: nextId('S', state.sales), date: new Date().toISOString().slice(0, 10), channel, clientId, branch, total, tax: total * .16 / 1.16, items: items.map(item => ({ ...item, price: byId(state.products, item.productId).price })) };
  state.sales.push(sale);
  const client = byId(state.clients, clientId);
  client.purchases += 1;
  client.total += total;
  const invoice = createInvoiceFromSale(sale, 'Facturación automática de energía Monsters Inc.');
  if (channel !== 'Punto Físico') createShipment(sale);
  addLog(channel, 'Ventas', 'Despacho de energía', `Venta ${sale.id} por ${money(total)}. Factura ${invoice.id}.`);
  return sale;
}

function createInvoiceFromSale(sale, concept) {
  const subtotal = sale.total / 1.16;
  const invoice = { id: nextId('F', state.invoices), saleId: sale.id, clientId: sale.clientId, channel: sale.channel, concept, subtotal, tax: sale.total - subtotal, total: sale.total, status: 'Emitida', date: sale.date };
  state.invoices.unshift(invoice);
  return invoice;
}

function createShipment(sale) {
  const client = byId(state.clients, sale.clientId);
  const shipment = { id: nextId('ENV', state.shipments), saleId: sale.id, channel: sale.channel, clientId: sale.clientId, branch: sale.branch, destination: sale.channel === 'Online' ? 'Ruta web asignada a puerta humana' : 'Muelle corporativo Monstrópolis', status: 'Pendiente', eta: futureDays(2) };
  state.shipments.unshift(shipment);
  addLog(sale.channel, 'Envíos', 'Envío generado', `${shipment.id} para ${client.name}.`);
}

function nextId(prefix, list) {
  return prefix + String(list.length + 1).padStart(3, '0');
}

function calculateCut() {
  const result = {};
  CHANNELS.forEach(c => result[c] = { count: 0, subtotal: 0, tax: 0, total: 0 });
  state.sales.forEach(s => {
    result[s.channel].count += 1;
    result[s.channel].total += s.total;
    result[s.channel].tax += s.tax;
    result[s.channel].subtotal += s.total - s.tax;
  });
  return result;
}

function createCsv(rows, columns) {
  return [columns.map(c => c.label).join(','), ...rows.map(row => columns.map(c => `"${String(row[c.key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
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

function openDocument(title, html) {
  state.lastDocument = html;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `<div class="doc">${html}</div>`;
  document.getElementById('modal').classList.add('open');
}

function printHtml(title, html) {
  const w = window.open('', '_blank');
  w.document.write(`<title>${title}</title><body style="font-family:Arial;padding:24px">${html}<script>print()<\/script></body>`);
  w.document.close();
}

function ticketHtml(sale) {
  const client = byId(state.clients, sale.clientId);
  const lines = sale.items.map(i => {
    const product = byId(state.products, i.productId);
    return `<div class="doc-row"><span>${product.name} x ${i.qty}</span><strong>${money(i.qty * i.price)}</strong></div>`;
  }).join('');
  return `<h3>Ticket de Energía Monsters Inc.</h3><p><strong>Venta:</strong> ${sale.id}</p><p><strong>Cliente:</strong> ${client.name}</p><p><strong>Canal:</strong> ${sale.channel}</p>${lines}<div class="doc-row"><span>Total</span><strong>${money(sale.total)}</strong></div>`;
}

function cfdiHtml(invoice) {
  const client = byId(state.clients, invoice.clientId);
  return `<h3>CFDI Fiscal de Energía</h3><p><strong>Folio:</strong> ${invoice.id}</p><p><strong>Cliente:</strong> ${client.name}</p><p><strong>Canal:</strong> ${invoice.channel}</p><p><strong>Concepto:</strong> ${invoice.concept}</p><div class="doc-row"><span>Subtotal</span><strong>${money(invoice.subtotal)}</strong></div><div class="doc-row"><span>IVA 16%</span><strong>${money(invoice.tax)}</strong></div><div class="doc-row"><span>Total</span><strong>${money(invoice.total)}</strong></div><pre>&lt;cfdi folio="${invoice.id}" total="${invoice.total.toFixed(2)}" cliente="${client.name}" /&gt;</pre>`;
}

function bindDynamicButtons() {
  document.querySelectorAll('[data-screen]').forEach(btn => btn.onclick = () => {
    const screen = btn.dataset.screen;
    if (!requirePermission(screen)) return;
    setState(s => s.activeScreen = screen);
  });
  document.querySelectorAll('[data-stock-filter]').forEach(btn => btn.onclick = () => setState(s => s.stockFilter = btn.dataset.stockFilter));
  document.querySelectorAll('[data-filter-client]').forEach(btn => btn.onclick = () => setState(s => s.clientFilter = btn.dataset.filterClient));
  document.querySelectorAll('[data-remove-cart]').forEach(btn => btn.onclick = () => setState(s => s.cart = s.cart.filter(i => i.productId !== btn.dataset.removeCart)));
  document.querySelectorAll('[data-delete-client]').forEach(btn => btn.onclick = () => {
    if (!requirePermission('clients')) return;
    setState(s => {
      const c = byId(s.clients, btn.dataset.deleteClient);
      s.clients = s.clients.filter(x => x.id !== c.id);
      addLog(c.channel, 'Clientes', 'Cliente eliminado', c.name);
    });
  });
  document.querySelectorAll('[data-edit-product]').forEach(btn => btn.onclick = () => editProduct(btn.dataset.editProduct));
  document.querySelectorAll('[data-download-cfdi]').forEach(btn => btn.onclick = () => {
    const invoice = byId(state.invoices, btn.dataset.downloadCfdi);
    const html = cfdiHtml(invoice);
    openDocument(`CFDI ${invoice.id}`, html);
    download(`${invoice.id}-cfdi.xml`, html, 'application/xml;charset=utf-8');
  });
  document.querySelectorAll('[data-shipment-status]').forEach(sel => sel.onchange = () => {
    const shipment = byId(state.shipments, sel.dataset.shipmentStatus);
    setState(s => {
      shipment.status = sel.value;
      addLog(shipment.channel, 'Envíos', 'Estado actualizado', `${shipment.id} cambió a ${sel.value}`);
    });
  });
  document.querySelectorAll('[data-view-shipment]').forEach(btn => btn.onclick = () => {
    const shipment = byId(state.shipments, btn.dataset.viewShipment);
    const client = byId(state.clients, shipment.clientId);
    openDocument(`Envío ${shipment.id}`, `<h3>Guía ${shipment.id}</h3><p><strong>Cliente:</strong> ${client.name}</p><p><strong>Canal:</strong> ${shipment.channel}</p><p><strong>Estado:</strong> ${shipment.status}</p><p><strong>Destino:</strong> ${shipment.destination}</p><p><strong>ETA:</strong> ${shipment.eta}</p>`);
  });
}

function editProduct(id) {
  if (!requirePermission('inventory')) return;
  const p = byId(state.products, id);
  openDocument('Editar producto', `<h3>${p.sku}</h3><label>Nombre<input id="editName" value="${p.name}"></label><label>Precio<input id="editPrice" type="number" value="${p.price}"></label><label>Stock<input id="editStock" type="number" value="${p.stock}"></label><button onclick="saveProductEdit('${p.id}')">Guardar cambios</button>`);
}

window.saveProductEdit = id => {
  setState(s => {
    const p = byId(s.products, id);
    p.name = document.getElementById('editName').value;
    p.price = Number(document.getElementById('editPrice').value);
    p.stock = Number(document.getElementById('editStock').value);
    addLog('General', 'Inventario', 'Producto editado', `${p.sku} actualizado`);
  });
  document.getElementById('modal').classList.remove('open');
};

function wireStaticEvents() {
  document.getElementById('currentRole').onchange = e => setState(s => {
    s.currentRole = e.target.value;
    addLog('General', 'Seguridad', 'Cambio de rol', `Rol activo: ${e.target.value}`);
  });
  document.getElementById('resetState').onclick = () => {
    localStorage.removeItem('monsters-erp-state-v3');
    state = initialState();
    render();
  };
  document.getElementById('addToCart').onclick = () => {
    if (!requirePermission('pos')) return;
    const productId = document.getElementById('posProduct').value;
    const qty = Math.max(1, Number(document.getElementById('posQty').value));
    const product = byId(state.products, productId);
    if (!product || product.stock < qty) return alert('Inventario insuficiente.');
    setState(s => {
      const item = s.cart.find(i => i.productId === productId);
      if (item) item.qty += qty;
      else s.cart.push({ productId, qty });
    });
  };
  document.getElementById('clearCart').onclick = () => setState(s => s.cart = []);
  document.getElementById('processPosSale').onclick = () => {
    if (!requirePermission('pos')) return;
    if (!state.cart.length) return alert('Agrega conceptos al ticket.');
    setState(s => {
      const sale = processSale('Punto Físico', document.getElementById('posClient').value, s.cart, 'Planta Susto Matriz');
      s.cart = [];
      const html = ticketHtml(sale);
      s.lastDocument = html;
      openDocument(`Ticket ${sale.id}`, html);
      printHtml(`Ticket ${sale.id}`, html);
    });
  };
  document.getElementById('runOnlineOrder').onclick = () => simulateChannelSale('Online');
  document.getElementById('runCorporateOrder').onclick = () => simulateChannelSale('Corporaciones');
  document.getElementById('simulateOnline').onclick = () => simulateChannelSale('Online');
  document.getElementById('simulateCorporate').onclick = () => simulateChannelSale('Corporaciones');
  document.getElementById('createClient').onclick = createClient;
  document.getElementById('createProduct').onclick = createProduct;
  document.getElementById('createEmployee').onclick = createEmployee;
  document.getElementById('saveRoleChanges').onclick = saveRoleChanges;
  document.getElementById('createRole').onclick = createRole;
  document.getElementById('issueInvoice').onclick = issueInvoice;
  document.getElementById('invoiceAmount').oninput = calculateInvoicePreview;
  document.getElementById('invoiceSearch').oninput = renderBilling;
  document.getElementById('invoiceFilter').onchange = e => setState(s => s.invoiceFilter = e.target.value);
  document.getElementById('processCut').onclick = () => setState(s => {
    s.cutResult = calculateCut();
    addLog('General', 'Corte', 'Corte procesado', document.getElementById('cutPeriod').value);
  });
  document.getElementById('downloadCut').onclick = () => download('corte-caja-monsters.csv', cutCsv());
  document.getElementById('exportAll').onclick = () => download('erp-monsters-excel.xls', fullCsv(), 'application/vnd.ms-excel;charset=utf-8');
  document.getElementById('exportClients').onclick = () => download('clientes-monsters.csv', createCsv(state.clients, [{ key: 'name', label: 'Cliente' }, { key: 'type', label: 'Tipo' }, { key: 'channel', label: 'Canal' }, { key: 'total', label: 'Total' }]));
  document.getElementById('exportInventory').onclick = () => download('inventario-monsters.csv', createCsv(state.products, [{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Producto' }, { key: 'stock', label: 'Stock' }, { key: 'price', label: 'Precio' }]));
  document.getElementById('exportInvoices').onclick = () => download('facturas-monsters.csv', createCsv(state.invoices, [{ key: 'id', label: 'Folio' }, { key: 'channel', label: 'Canal' }, { key: 'total', label: 'Total' }, { key: 'status', label: 'Estado' }]));
  document.getElementById('exportShipments').onclick = () => download('envios-monsters.csv', createCsv(state.shipments, [{ key: 'id', label: 'Guia' }, { key: 'channel', label: 'Canal' }, { key: 'status', label: 'Estado' }, { key: 'eta', label: 'ETA' }]));
  document.getElementById('exportEmployees').onclick = () => download('empleados-monsters.csv', createCsv(state.employees, [{ key: 'name', label: 'Nombre' }, { key: 'email', label: 'Correo' }, { key: 'role', label: 'Rol' }, { key: 'active', label: 'Activo' }]));
  document.getElementById('exportLogs').onclick = () => download('bitacora-planta.csv', createCsv(state.logs, [{ key: 'date', label: 'Fecha' }, { key: 'role', label: 'Rol' }, { key: 'channel', label: 'Canal' }, { key: 'action', label: 'Accion' }, { key: 'detail', label: 'Detalle' }]));
  document.getElementById('closeModal').onclick = () => document.getElementById('modal').classList.remove('open');
  document.getElementById('printModal').onclick = () => printHtml(document.getElementById('modalTitle').textContent, document.getElementById('modalBody').innerHTML);
  document.getElementById('downloadModal').onclick = () => download('documento-monsters.html', document.getElementById('modalBody').innerHTML, 'text/html;charset=utf-8');
  document.querySelectorAll('[data-export]').forEach(btn => btn.onclick = () => download(`${btn.dataset.export}-monsters.csv`, fullCsv()));
}

function simulateChannelSale(channel) {
  if (!requirePermission('pos')) return;
  const client = state.clients.find(c => c.channel === channel) || state.clients[0];
  const product = channel === 'Corporaciones' ? state.products.find(p => p.category === 'Corporativo' && p.stock > 0) : state.products.find(p => p.stock > 0);
  if (!product) return alert('No hay inventario disponible.');
  setState(s => {
    const qty = channel === 'Corporaciones' ? 1 : 2;
    const sale = processSale(channel, client.id, [{ productId: product.id, qty }], product.branch);
    const html = ticketHtml(sale);
    s.lastDocument = html;
    openDocument(`Operación ${sale.id}`, html);
  });
}

function createClient() {
  if (!requirePermission('clients')) return;
  const name = document.getElementById('clientName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  if (!name || !email.includes('@')) return alert('Captura nombre y correo válido.');
  setState(s => {
    const client = { id: nextId('C', s.clients), name, email, type: document.getElementById('clientType').value, channel: document.getElementById('clientChannel').value, branch: document.getElementById('clientBranch').value, purchases: 0, total: 0 };
    s.clients.push(client);
    addLog(client.channel, 'Clientes', 'Cliente registrado', client.name);
  });
}

function createProduct() {
  if (!requirePermission('inventory')) return;
  const name = document.getElementById('productName').value.trim();
  const sku = document.getElementById('productSku').value.trim().toUpperCase();
  if (!name || !sku) return alert('Nombre y SKU son obligatorios.');
  if (state.products.some(p => p.sku === sku || p.name.toLowerCase() === name.toLowerCase())) return alert('El producto ya existe');
  setState(s => {
    const product = { id: nextId('P', s.products), sku, name, category: document.getElementById('productCategory').value || 'Energía', branch: 'Planta Susto Matriz', stock: Number(document.getElementById('productStock').value), price: Number(document.getElementById('productPrice').value) };
    s.products.push(product);
    addLog('General', 'Inventario', 'Producto registrado', `${product.sku} ${product.name}`);
  });
}

function createEmployee() {
  if (!requirePermission('access')) return;
  const name = document.getElementById('employeeName').value.trim();
  const email = document.getElementById('employeeEmail').value.trim();
  if (!name || !email.includes('@')) return alert('Captura empleado y correo válido.');
  setState(s => {
    const employee = { id: nextId('E', s.employees), name, email, role: document.getElementById('employeeRole').value, branch: document.getElementById('employeeBranch').value, active: true };
    s.employees.push(employee);
    addLog('General', 'Seguridad', 'Empleado registrado', `${employee.name} como ${employee.role}`);
  });
}

function saveRoleChanges() {
  if (!requirePermission('access')) return;
  const role = document.getElementById('roleEditor').value;
  setState(s => {
    s.roles[role] = [...document.querySelectorAll('[data-permission]:checked')].map(i => i.dataset.permission);
    addLog('General', 'Seguridad', 'Permisos actualizados', role);
  });
}

function createRole() {
  if (!requirePermission('access')) return;
  const name = document.getElementById('newRoleName').value.trim();
  if (!name) return alert('Captura el nombre del rol.');
  if (state.roles[name]) return alert('El rol ya existe.');
  setState(s => {
    s.roles[name] = [...document.querySelectorAll('[data-permission]:checked')].map(i => i.dataset.permission);
    addLog('General', 'Seguridad', 'Rol creado', name);
  });
}

function issueInvoice() {
  if (!requirePermission('billing')) return;
  const clientId = document.getElementById('invoiceClient').value;
  const channel = document.getElementById('invoiceChannel').value;
  const concept = document.getElementById('invoiceConcept').value.trim() || 'Suministro de energía Monsters Inc.';
  const amount = Number(document.getElementById('invoiceAmount').value);
  if (amount <= 0) return alert('Importe inválido.');
  setState(s => {
    const invoice = { id: nextId('F', s.invoices), saleId: 'MANUAL', clientId, channel, concept, subtotal: amount, tax: amount * .16, total: amount * 1.16, status: 'Emitida', date: new Date().toISOString().slice(0, 10) };
    s.invoices.unshift(invoice);
    addLog(channel, 'Facturación', 'CFDI emitido', `${invoice.id} por ${money(invoice.total)}`);
    openDocument(`CFDI ${invoice.id}`, cfdiHtml(invoice));
  });
}

document.addEventListener('click', e => {
  if (e.target.matches('[data-toggle-employee]')) {
    if (!requirePermission('access')) return;
    setState(s => {
      const employee = byId(s.employees, e.target.dataset.toggleEmployee);
      employee.active = !employee.active;
      addLog('General', 'Seguridad', employee.active ? 'Empleado activado' : 'Empleado desactivado', employee.name);
    });
  }
});

function fullCsv() {
  return [
    'VENTAS',
    createCsv(state.sales, [{ key: 'id', label: 'Venta' }, { key: 'date', label: 'Fecha' }, { key: 'channel', label: 'Canal' }, { key: 'total', label: 'Total' }]),
    '',
    'INVENTARIO',
    createCsv(state.products, [{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Producto' }, { key: 'stock', label: 'Stock' }, { key: 'price', label: 'Precio' }])
  ].join('\n');
}

function cutCsv() {
  const result = state.cutResult || calculateCut();
  return ['Canal,Ventas,Subtotal,IVA,Total', ...CHANNELS.map(c => `${c},${result[c].count},${result[c].subtotal.toFixed(2)},${result[c].tax.toFixed(2)},${result[c].total.toFixed(2)}`)].join('\n');
}

wireStaticEvents();
render();
