<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monsters Inc. — Sistema Interno de Ventas</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #0B0F19;
            --bg-surface: #161F30;
            --bg-card: rgba(30, 41, 59, 0.7);
            --primary: #00D2FC;
            --primary-hover: #00B4D8;
            --accent: #A55EEA;
            --text-main: #F3F4F6;
            --text-muted: #9CA3AF;
            --border: rgba(255, 255, 255, 0.08);
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --font-family: 'Outfit', sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-base);
            color: var(--text-main);
            font-family: var(--font-family);
            min-height: 100vh;
            padding: 24px;
            background-image: radial-gradient(circle at 10% 20%, rgba(0, 210, 252, 0.05) 0%, transparent 40%),
                              radial-gradient(circle at 90% 80%, rgba(165, 94, 234, 0.05) 0%, transparent 40%);
            background-attachment: fixed;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        /* HEADER */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            background: rgba(22, 31, 48, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            border-radius: 16px;
            margin-bottom: 32px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 700;
            font-size: 20px;
        }

        .logo-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 28px;
            letter-spacing: 2px;
            background: linear-gradient(to right, var(--primary), #fff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), #00B4D8);
            color: #0B0F19;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 210, 252, 0.4);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-main);
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--text-muted);
        }

        .btn-danger {
            background: rgba(239, 68, 68, 0.2);
            color: #FFA3A3;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-danger:hover {
            background: rgba(239, 68, 68, 0.4);
        }

        /* KPI CARDS */
        .kpis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(8px);
        }

        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--primary);
        }

        .kpi-card.kpi-revenue::before { background: var(--success); }
        .kpi-card.kpi-sales::before { background: var(--primary); }
        .kpi-card.kpi-avg::before { background: var(--accent); }
        .kpi-card.kpi-stock::before { background: var(--warning); }

        .kpi-label {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .kpi-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #fff;
        }

        .kpi-trend {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .trend-up { color: var(--success); }
        .trend-down { color: var(--danger); }

        /* DASHBOARD BODY */
        .dashboard-layout {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 32px;
        }

        @media (max-width: 1024px) {
            .dashboard-layout {
                grid-template-columns: 1fr;
            }
        }

        /* CRUDS & TABLES */
        .panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(8px);
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 16px;
        }

        .panel-title {
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .search-wrapper {
            position: relative;
            width: 300px;
        }

        .search-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 14px;
            color: #fff;
            font-family: var(--font-family);
            font-size: 13px;
            transition: all 0.2s;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 10px rgba(0, 210, 252, 0.15);
        }

        /* TABLE */
        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            padding: 14px 16px;
            color: var(--text-muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid var(--border);
            font-weight: 600;
        }

        td {
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 14px;
            vertical-align: middle;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }

        .badge-success { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.2); }

        .items-list {
            list-style: none;
            font-size: 12px;
            color: var(--text-muted);
            max-width: 250px;
        }

        .items-list li {
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .item-icon {
            font-size: 14px;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
        }

        /* FORM SIDE PANEL */
        .form-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 6px;
        }

        .form-control {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 14px;
            color: #fff;
            font-family: var(--font-family);
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 10px rgba(0, 210, 252, 0.15);
        }

        select.form-control option {
            background-color: var(--bg-surface);
            color: #fff;
        }

        /* MODAL */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .modal.open {
            opacity: 1;
            pointer-events: all;
        }

        .modal-content {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }

        .modal.open .modal-content {
            transform: translateY(0);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
        }

        .close-modal {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 20px;
            cursor: pointer;
        }

        .close-modal:hover {
            color: #fff;
        }
    </style>
</head>
<body>

<div class="container">
    
    <!-- HEADER -->
    <header>
        <div class="logo-section">
            <div class="logo-icon">👁️</div>
            <div>
                <h1 class="logo-title">MONSTERS INC.</h1>
                <p style="font-size: 10px; color: var(--primary); letter-spacing: 1px; font-weight: 600;">SISTEMA INTERNO DE VENTAS (DBA CRUD)</p>
            </div>
        </div>
        <div class="nav-actions">
            <a href="index.html" class="btn btn-outline">🛒 Ir a la Tienda</a>
            <button class="btn btn-primary" onclick="loadDashboard()">🔄 Refrescar Panel</button>
        </div>
    </header>

    <!-- KPI CARDS -->
    <div class="kpis-grid">
        <div class="kpi-card kpi-revenue">
            <div class="kpi-label">Ingresos Totales</div>
            <div class="kpi-value" id="kpi-revenue">$0.00</div>
            <div class="kpi-trend trend-up">▲ 14.8% este mes</div>
        </div>
        <div class="kpi-card kpi-sales">
            <div class="kpi-label">Ventas Registradas</div>
            <div class="kpi-value" id="kpi-sales">0</div>
            <div class="kpi-trend trend-up">▲ 8.3% vs semana anterior</div>
        </div>
        <div class="kpi-card kpi-avg">
            <div class="kpi-label">Ticket Promedio</div>
            <div class="kpi-value" id="kpi-avg">$0.00</div>
            <div class="kpi-trend trend-up">▲ 2.5% de incremento</div>
        </div>
        <div class="kpi-card kpi-stock">
            <div class="kpi-label">Inventario Activo</div>
            <div class="kpi-value" id="kpi-stock">0 items</div>
            <div class="kpi-trend" style="color: var(--text-muted);">Stock total acumulado</div>
        </div>
    </div>

    <!-- MAIN DASHBOARD LAYOUT -->
    <div class="dashboard-layout">
        
        <!-- SALES LIST (READ, UPDATE, DELETE) -->
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">📦 Historial y Control de Ventas</h2>
                <div class="search-wrapper">
                    <input type="text" class="search-input" id="searchSales" placeholder="Buscar por cliente..." oninput="filterSalesTable()">
                </div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Pago</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="salesTableBody">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">Cargando datos del sistema...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SIMULATE SALE PANEL (CREATE - MANUAL CRUD INJECTION) -->
        <div class="panel">
            <h3 class="form-title">⚡ Registrar Venta Manual</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
                Registra una venta simulada directamente en la base de datos (con control automático de stock y disparadores de transacción).
            </p>
            <form id="manualSaleForm" onsubmit="handleManualSale(event)">
                <div class="form-group">
                    <label class="form-label">Nombre del Cliente</label>
                    <input type="text" class="form-control" id="formName" required placeholder="Ej. James P. Sullivan">
                </div>
                <div class="form-group">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" id="formEmail" required placeholder="Ej. sulley@monsters.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Método de Pago</label>
                    <select class="form-control" id="formPayment">
                        <option value="Tarjeta de Crédito">💳 Tarjeta de Crédito</option>
                        <option value="PayPal">PayPal</option>
                        <option value="SPEI">SPEI (Transferencia)</option>
                        <option value="OXXO">OXXO Pay</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Producto a Comprar</label>
                    <select class="form-control" id="formProduct" required>
                        <!-- Cargados dinámicamente -->
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" id="formQty" min="1" max="10" value="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Notas Adicionales</label>
                    <textarea class="form-control" id="formNotes" rows="2" placeholder="Ej. Entrega urgente en Monsters Inc."></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
                    ➕ Insertar Transacción
                </button>
            </form>
        </div>

    </div>

</div>

<!-- EDIT SALE MODAL (UPDATE - CRUD) -->
<div class="modal" id="editModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">✏️ Editar Transacción</h3>
            <button class="close-modal" onclick="closeEditModal()">✕</button>
        </div>
        <form id="editSaleForm" onsubmit="handleEditSale(event)">
            <input type="hidden" id="editId">
            <div class="form-group">
                <label class="form-label">Nombre del Cliente</label>
                <input type="text" class="form-control" id="editName" required>
            </div>
            <div class="form-group">
                <label class="form-label">Método de Pago</label>
                <select class="form-control" id="editPayment">
                    <option value="Tarjeta de Crédito">💳 Tarjeta de Crédito</option>
                    <option value="PayPal">PayPal</option>
                    <option value="SPEI">SPEI</option>
                    <option value="OXXO">OXXO Pay</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Estado de la Venta</label>
                <select class="form-control" id="editStatus">
                    <option value="Completado">🟢 Completado</option>
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="Cancelado">🔴 Cancelado</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 24px;">
                <button type="button" class="btn btn-outline" style="flex: 1; justify-content: center;" onclick="closeEditModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<script>
    let allSales = [];
    let allProducts = [];

    // Formateador de moneda
    const fmt = n => '$' + parseFloat(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Cargar toda la información
    async function loadDashboard() {
        try {
            // Cargar Ventas
            const resSales = await fetch('api.php?action=get_sales');
            allSales = await resSales.json();
            
            // Cargar Productos
            const resProducts = await fetch('api.php?action=get_products');
            allProducts = await resProducts.json();

            if (allSales.error || allProducts.error) {
                showAPIError(allSales.error || allProducts.error);
                return;
            }

            renderSalesTable(allSales);
            renderProductSelector();
            updateKPIs();
        } catch (e) {
            console.error(e);
            showAPIError(e.message);
        }
    }

    function showAPIError(msg) {
        document.getElementById('salesTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--danger); font-weight: 500;">
                    ⚠️ Error de conexión: ${msg}<br>
                    <span style="font-size:12px;color:var(--text-muted);font-weight:400;margin-top:10px;display:block">
                        Asegúrate de que tu servidor Apache y MySQL estén activos e importaste el "database.sql".
                    </span>
                </td>
            </tr>`;
    }

    // Renderizar Selector de Productos
    function renderProductSelector() {
        const select = document.getElementById('formProduct');
        select.innerHTML = allProducts.map(p => 
            `<option value="${p.id}">${p.icon} ${p.brand} - ${p.name.slice(0, 30)}... (Stock: ${p.stock})</option>`
        ).join('');
    }

    // Calcular y renderizar KPIs
    function updateKPIs() {
        let totalRevenue = 0;
        let completedSales = 0;
        let totalStock = 0;

        allSales.forEach(s => {
            if (s.estado === 'Completado') {
                totalRevenue += s.total;
                completedSales++;
            }
        });

        allProducts.forEach(p => {
            totalStock += p.stock;
        });

        document.getElementById('kpi-revenue').textContent = fmt(totalRevenue);
        document.getElementById('kpi-sales').textContent = allSales.length;
        document.getElementById('kpi-avg').textContent = allSales.length ? fmt(totalRevenue / completedSales) : '$0.00';
        document.getElementById('kpi-stock').textContent = totalStock + ' unidades';
    }

    // Renderizar la tabla de ventas
    function renderSalesTable(sales) {
        const tbody = document.getElementById('salesTableBody');
        if (sales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No hay ventas registradas en el sistema.
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = sales.map(s => {
            let statusClass = 'badge-success';
            if (s.estado === 'Pendiente') statusClass = 'badge-warning';
            if (s.estado === 'Cancelado') statusClass = 'badge-danger';

            const dateFormatted = new Date(s.fecha).toLocaleString('es-MX', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            const itemsHtml = s.items.map(item => 
                `<li><span class="item-icon">${item.icon}</span> ${item.cantidad}x ${item.name.slice(0,20)}...</li>`
            ).join('');

            return `
                <tr>
                    <td style="font-weight:700; color:var(--primary);">#${s.id}</td>
                    <td style="font-size:12px; color:var(--text-muted);">${dateFormatted}</td>
                    <td>
                        <div style="font-weight:600; color:#fff;">${s.cliente_nombre}</div>
                        <div style="font-size:11px; color:var(--text-muted);">${s.cliente_email}</div>
                    </td>
                    <td><ul class="items-list">${itemsHtml}</ul></td>
                    <td style="font-size:12px;">${s.metodo_pago}</td>
                    <td style="font-weight:600; color:#fff;">${fmt(s.total)}</td>
                    <td><span class="badge ${statusClass}">${s.estado}</span></td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn btn-outline" style="padding:6px 12px; font-size:11px;" onclick="openEditModal(${s.id}, '${s.cliente_nombre}', '${s.metodo_pago}', '${s.estado}')">✏️ Editar</button>
                            <button class="btn btn-danger" style="padding:6px 12px; font-size:11px;" onclick="deleteSale(${s.id})">🗑 Cancelar</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    }

    // Filtrar tabla dinámicamente
    function filterSalesTable() {
        const query = document.getElementById('searchSales').value.toLowerCase().trim();
        if (!query) {
            renderSalesTable(allSales);
            return;
        }

        const filtered = allSales.filter(s => 
            s.cliente_nombre.toLowerCase().includes(query) || 
            s.cliente_email.toLowerCase().includes(query) ||
            s.metodo_pago.toLowerCase().includes(query) ||
            s.estado.toLowerCase().includes(query)
        );
        renderSalesTable(filtered);
    }

    // --- CRUD: CREATE (Manual Sale) ---
    async function handleManualSale(e) {
        e.preventDefault();
        
        const productId = parseInt(document.getElementById('formProduct').value);
        const qty = parseInt(document.getElementById('formQty').value);

        const data = {
            cliente_nombre: document.getElementById('formName').value,
            cliente_email: document.getElementById('formEmail').value,
            metodo_pago: document.getElementById('formPayment').value,
            notas: document.getElementById('formNotes').value,
            items: [
                { id: productId, qty: qty }
            ]
        };

        try {
            const res = await fetch('api.php?action=create_sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert(`¡Venta manual #${result.venta_id} creada con éxito por un total de ${fmt(result.total)}!`);
                document.getElementById('manualSaleForm').reset();
                loadDashboard();
            } else {
                alert(`⚠️ Error: ${result.error}`);
            }
        } catch (err) {
            alert('Error en la petición: ' + err.message);
        }
    }

    // --- CRUD: UPDATE (Modal edit) ---
    function openEditModal(id, name, payment, status) {
        document.getElementById('editId').value = id;
        document.getElementById('editName').value = name;
        document.getElementById('editPayment').value = payment;
        document.getElementById('editStatus').value = status;
        document.getElementById('editModal').classList.add('open');
    }

    function closeEditModal() {
        document.getElementById('editModal').classList.remove('open');
    }

    async function handleEditSale(e) {
        e.preventDefault();

        const data = {
            id: document.getElementById('editId').value,
            cliente_nombre: document.getElementById('editName').value,
            metodo_pago: document.getElementById('editPayment').value,
            estado: document.getElementById('editStatus').value
        };

        try {
            const res = await fetch('api.php?action=update_sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                closeEditModal();
                loadDashboard();
            } else {
                alert(`⚠️ Error al actualizar: ${result.error}`);
            }
        } catch (err) {
            alert('Error en la petición: ' + err.message);
        }
    }

    // --- CRUD: DELETE ---
    async function deleteSale(id) {
        if (!confirm(`¿Estás seguro de que deseas cancelar la venta #${id}? El stock correspondiente de los productos será devuelto al inventario y el registro de la venta se eliminará.`)) {
            return;
        }

        try {
            const res = await fetch('api.php?action=delete_sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await res.json();

            if (result.success) {
                loadDashboard();
            } else {
                alert(`⚠️ Error al eliminar: ${result.error}`);
            }
        } catch (err) {
            alert('Error en la petición: ' + err.message);
        }
    }

    // Cargar al cargar la página
    document.addEventListener('DOMContentLoaded', loadDashboard);
</script>
</body>
</html>
