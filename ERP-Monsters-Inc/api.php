<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($requestMethod === 'OPTIONS') {
    exit;
}

$pdo = require_once __DIR__ . '/conexion.php';
$action = $_GET['action'] ?? '';

function response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function input(): array
{
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function logAction(PDO $pdo, string $action, int $employeeId = 1): void
{
    $stmt = $pdo->prepare('INSERT INTO BITACORA (id_empleado, accion) VALUES (?, ?)');
    $stmt->execute([$employeeId, $action]);
}

function ensureRole(PDO $pdo, string $name): int
{
    $stmt = $pdo->prepare('SELECT id_rol FROM ROL WHERE nombre_rol = ? LIMIT 1');
    $stmt->execute([$name]);
    $id = $stmt->fetchColumn();
    if ($id !== false) return (int)$id;

    $stmt = $pdo->prepare('INSERT INTO ROL (nombre_rol) VALUES (?)');
    $stmt->execute([$name]);
    return (int)$pdo->lastInsertId();
}

function ensureEmployee(PDO $pdo, string $name, string $email, string $password, int $roleId, ?int $branchId, ?int $regionId): void
{
    $stmt = $pdo->prepare('SELECT id_empleado FROM EMPLEADO WHERE correo = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() !== false) return;

    $stmt = $pdo->prepare('INSERT INTO EMPLEADO (nombre, correo, `contraseña`, id_rol, id_sucursal, id_region, activo) VALUES (?, ?, ?, ?, ?, ?, TRUE)');
    $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $roleId, $branchId, $regionId]);
}

function ensureCatalogs(PDO $pdo): void
{
    $pdo->exec("INSERT IGNORE INTO REGION (id_region, nombre_region) VALUES (1, 'Centro'), (2, 'Norte'), (3, 'Corporativo')");
    $pdo->exec("INSERT IGNORE INTO SUCURSAL (id_sucursal, nombre, id_region, direccion, es_centro_distribucion) VALUES
        (1, 'Susto Matriz', 1, 'Plataforma en linea Monster Inc.', TRUE),
        (2, 'Susto Norte', 2, 'Sucursal fisica norte', FALSE),
        (3, 'Atencion Corporativa', 3, 'Oficina de clientes corporativos', FALSE)");
    $pdo->exec("INSERT IGNORE INTO ESTADO_ENVIO (id_estado_envio, nombre) VALUES (1, 'Preparando'), (2, 'En camino'), (3, 'Entregado'), (4, 'Fallido')");

    $admin = ensureRole($pdo, 'Administrador');
    $manager = ensureRole($pdo, 'Gerente de sucursal');
    $seller = ensureRole($pdo, 'Vendedor');
    $warehouse = ensureRole($pdo, 'Almacenista');
    $accountant = ensureRole($pdo, 'Contador');

    ensureEmployee($pdo, 'Admin General', 'admin@monsters.com', 'Admin123*', $admin, 1, 1);
    ensureEmployee($pdo, 'Celia Mae', 'gerente@monsters.com', 'Gerente123*', $manager, 1, 1);
    ensureEmployee($pdo, 'Mike Wazowski', 'vendedor@monsters.com', 'Vendedor123*', $seller, 2, null);
    ensureEmployee($pdo, 'Roz Okonkwo', 'almacen@monsters.com', 'Almacen123*', $warehouse, 1, null);
    ensureEmployee($pdo, 'Henry Waternoose', 'contador@monsters.com', 'Contador123*', $accountant, null, 1);

    $products = [
        ['Puerta estandar de sustos', 'PRD-001', 900.00, 'Puertas', 1500.00],
        ['Puerta premium peluda', 'PRD-002', 1800.00, 'Puertas', 3200.00],
        ['Contenedor de gritos', 'PRD-003', 650.00, 'Energia', 1100.00],
        ['Kit de seguridad CDA', 'PRD-004', 450.00, 'Seguridad', 850.00],
        ['Monitor de energia de risas', 'PRD-005', 1200.00, 'Energia', 2100.00],
    ];

    $find = $pdo->prepare('SELECT id_producto FROM PRODUCTO WHERE sku = ? LIMIT 1');
    $insertProduct = $pdo->prepare('INSERT INTO PRODUCTO (nombre, sku, costo_base) VALUES (?, ?, ?)');
    $categoryExists = $pdo->prepare('SELECT COUNT(*) FROM CATEGORIA_PRODUCTO WHERE id_producto = ? AND fecha_fin IS NULL');
    $insertCategory = $pdo->prepare('INSERT INTO CATEGORIA_PRODUCTO (id_producto, categoria, fecha_inicio) VALUES (?, ?, CURDATE())');
    $priceExists = $pdo->prepare('SELECT COUNT(*) FROM PRECIO_CANAL WHERE id_producto = ? AND canal = ? AND fecha_vigencia_fin IS NULL');
    $insertPrice = $pdo->prepare('INSERT INTO PRECIO_CANAL (id_producto, canal, precio_venta, fecha_vigencia_inicio) VALUES (?, ?, ?, CURDATE())');
    $insertStock = $pdo->prepare('INSERT INTO INVENTARIO (id_sucursal, id_producto, cantidad_disponible) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad_disponible = cantidad_disponible');

    foreach ($products as [$name, $sku, $cost, $category, $linePrice]) {
        $find->execute([$sku]);
        $id = $find->fetchColumn();
        if ($id === false) {
            $insertProduct->execute([$name, $sku, $cost]);
            $id = (int)$pdo->lastInsertId();
        } else {
            $id = (int)$id;
        }

        $categoryExists->execute([$id]);
        if ((int)$categoryExists->fetchColumn() === 0) $insertCategory->execute([$id, $category]);

        foreach (['Linea' => $linePrice, 'Fisica' => round($linePrice * 1.05, 2), 'Corporativo' => round($linePrice * 0.90, 2)] as $channel => $price) {
            $priceExists->execute([$id, $channel]);
            if ((int)$priceExists->fetchColumn() === 0) $insertPrice->execute([$id, $channel, $price]);
        }

        $insertStock->execute([1, $id, 20]);
        $insertStock->execute([2, $id, 12]);
        $insertStock->execute([3, $id, 8]);
    }

    $channelCount = (int)$pdo->query('SELECT COUNT(DISTINCT canal_venta) FROM VENTA')->fetchColumn();
    if ($channelCount < 3) {
        seedBusinessActivity($pdo);
    }
}

function seedBusinessActivity(PDO $pdo): void
{
    $clients = [
        ['Individual', 'Boo', 'BOO260101AAA', 'boo@monsters.com', '5550001001', 'Linea'],
        ['Individual', 'Mike Wazowski', 'MIKE790304AAB', 'mike@monsters.com', '5550001002', 'Fisica'],
        ['Corporativo', 'Fear Tech S.A. de C.V.', 'FTE260101FT1', 'compras@feartech.com', '5550001003', 'Corporativo'],
    ];

    $clientStmt = $pdo->prepare('INSERT INTO CLIENTE (tipo_cliente, nombre_razon_social, rfc, correo, telefono) VALUES (?, ?, ?, ?, ?)');
    $addressStmt = $pdo->prepare('INSERT INTO DIRECCION_CLIENTE (id_cliente, direccion, ciudad, estado, codigo_postal) VALUES (?, ?, ?, ?, ?)');
    $saleStmt = $pdo->prepare("INSERT INTO VENTA (id_cliente, id_empleado, id_sucursal, canal_venta, estado_venta, subtotal, total) VALUES (?, 1, ?, ?, 'Pagada', ?, ?)");
    $detailStmt = $pdo->prepare('INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario_historico) VALUES (?, ?, ?, ?)');
    $invoiceStmt = $pdo->prepare('INSERT INTO FACTURA (id_venta, uso_cfdi, sello_digital) VALUES (?, ?, ?)');
    $shippingStmt = $pdo->prepare('INSERT INTO ENVIO (id_venta, id_direccion, id_estado_envio, fecha_estimada_entrega, numero_guia) VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 3 DAY), ?)');

    $productIds = $pdo->query("SELECT sku, id_producto FROM PRODUCTO WHERE sku IN ('PRD-001','PRD-002','PRD-003')")->fetchAll(PDO::FETCH_KEY_PAIR);
    $skus = ['PRD-001', 'PRD-002', 'PRD-003'];

    foreach ($clients as $index => [$type, $name, $rfc, $email, $phone, $channel]) {
        $clientStmt->execute([$type, $name, $rfc, $email, $phone]);
        $clientId = (int)$pdo->lastInsertId();
        $addressStmt->execute([$clientId, 'Calle Integracion ' . ($index + 1), 'Monstropolis', 'Centro', '0000' . ($index + 1)]);
        $addressId = (int)$pdo->lastInsertId();

        $productId = (int)$productIds[$skus[$index]];
        $price = currentPrice($pdo, $productId, $channel);
        $quantity = $index + 1;
        $total = $price * $quantity;
        $branch = $channel === 'Corporativo' ? 3 : ($channel === 'Fisica' ? 2 : 1);

        $saleStmt->execute([$clientId, $branch, $channel, $total, $total]);
        $saleId = (int)$pdo->lastInsertId();
        $detailStmt->execute([$saleId, $productId, $quantity, $price]);
        $pdo->prepare('UPDATE INVENTARIO SET cantidad_disponible = GREATEST(cantidad_disponible - ?, 0) WHERE id_sucursal = ? AND id_producto = ?')->execute([$quantity, $branch, $productId]);

        $invoiceStmt->execute([$saleId, 'G03', 'SEAL-MONSTER-' . $saleId]);
        if ($channel === 'Linea') {
            $shippingStmt->execute([$saleId, $addressId, 2, 'GUA-MI-' . str_pad((string)$saleId, 5, '0', STR_PAD_LEFT)]);
        }
    }

    logAction($pdo, 'Datos iniciales creados para comparar Linea, Fisica y Corporativo');
}

function currentPrice(PDO $pdo, int $productId, string $channel): float
{
    $stmt = $pdo->prepare("SELECT precio_venta FROM PRECIO_CANAL WHERE id_producto = ? AND canal = ? AND fecha_vigencia_inicio <= CURDATE() AND (fecha_vigencia_fin IS NULL OR fecha_vigencia_fin >= CURDATE()) ORDER BY fecha_vigencia_inicio DESC, id_precio DESC LIMIT 1");
    $stmt->execute([$productId, $channel]);
    $price = $stmt->fetchColumn();
    if ($price === false) throw new RuntimeException('No hay precio vigente para el canal seleccionado.');
    return (float)$price;
}

function getOrCreateClient(PDO $pdo, ?int $id = null): int
{
    if ($id) {
        $stmt = $pdo->prepare('SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?');
        $stmt->execute([$id]);
        if ($stmt->fetchColumn()) return $id;
    }
    $stmt = $pdo->query("SELECT id_cliente FROM CLIENTE ORDER BY id_cliente ASC LIMIT 1");
    $found = $stmt->fetchColumn();
    if ($found) return (int)$found;

    $pdo->prepare("INSERT INTO CLIENTE (tipo_cliente, nombre_razon_social, correo) VALUES ('Individual', 'Cliente mostrador', 'mostrador@monsters.com')")->execute();
    return (int)$pdo->lastInsertId();
}

function dashboardData(PDO $pdo): array
{
    $products = $pdo->query("SELECT p.id_producto AS id, p.nombre, p.sku, COALESCE(pc.precio_venta, p.costo_base) AS precio, COALESCE(cp.categoria, 'General') AS categoria, COALESCE(SUM(i.cantidad_disponible), 0) AS stock
        FROM PRODUCTO p
        LEFT JOIN PRECIO_CANAL pc ON pc.id_producto = p.id_producto AND pc.canal = 'Fisica' AND pc.fecha_vigencia_fin IS NULL
        LEFT JOIN CATEGORIA_PRODUCTO cp ON cp.id_producto = p.id_producto AND cp.fecha_fin IS NULL
        LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
        GROUP BY p.id_producto, p.nombre, p.sku, pc.precio_venta, p.costo_base, cp.categoria
        ORDER BY p.id_producto ASC")->fetchAll();

    $inventory = $pdo->query("SELECT i.id_sucursal, s.nombre AS sucursal, p.id_producto AS id, p.sku, p.nombre, i.cantidad_disponible AS stock
        FROM INVENTARIO i
        INNER JOIN SUCURSAL s ON s.id_sucursal = i.id_sucursal
        INNER JOIN PRODUCTO p ON p.id_producto = i.id_producto
        ORDER BY s.id_sucursal, p.sku")->fetchAll();

    $clients = $pdo->query("SELECT c.id_cliente AS id, c.nombre_razon_social AS nombre, c.rfc, c.tipo_cliente AS tipo, c.correo, c.telefono,
        COALESCE(SUM(CASE WHEN v.canal_venta = 'Linea' THEN v.total END), 0) AS total_linea,
        COALESCE(SUM(CASE WHEN v.canal_venta = 'Fisica' THEN v.total END), 0) AS total_fisica,
        COALESCE(SUM(CASE WHEN v.canal_venta = 'Corporativo' THEN v.total END), 0) AS total_corporativo
        FROM CLIENTE c
        LEFT JOIN VENTA v ON v.id_cliente = c.id_cliente
        GROUP BY c.id_cliente
        ORDER BY c.id_cliente DESC")->fetchAll();

    $employees = $pdo->query("SELECT e.id_empleado AS id, e.nombre, e.correo, e.activo, r.nombre_rol AS rol, s.nombre AS sucursal
        FROM EMPLEADO e
        INNER JOIN ROL r ON r.id_rol = e.id_rol
        LEFT JOIN SUCURSAL s ON s.id_sucursal = e.id_sucursal
        ORDER BY e.id_empleado ASC")->fetchAll();

    $roles = $pdo->query('SELECT id_rol AS id, nombre_rol AS nombre FROM ROL ORDER BY id_rol')->fetchAll();
    $branches = $pdo->query('SELECT id_sucursal AS id, nombre FROM SUCURSAL ORDER BY id_sucursal')->fetchAll();

    $salesByChannel = $pdo->query("SELECT canal_venta AS canal, COUNT(*) AS ventas, COALESCE(SUM(total),0) AS total FROM VENTA GROUP BY canal_venta")->fetchAll();
    $salesByRegion = $pdo->query("SELECT r.nombre_region AS region, COUNT(v.id_venta) AS ventas, COALESCE(SUM(v.total),0) AS total
        FROM REGION r
        LEFT JOIN SUCURSAL s ON s.id_region = r.id_region
        LEFT JOIN VENTA v ON v.id_sucursal = s.id_sucursal
        GROUP BY r.id_region, r.nombre_region")->fetchAll();

    $shipments = $pdo->query("SELECT en.id_envio AS id, en.id_venta, dc.direccion, ee.nombre AS estado, en.fecha_estimada_entrega, en.numero_guia
        FROM ENVIO en
        INNER JOIN ESTADO_ENVIO ee ON ee.id_estado_envio = en.id_estado_envio
        INNER JOIN DIRECCION_CLIENTE dc ON dc.id_direccion = en.id_direccion
        ORDER BY en.id_envio DESC")->fetchAll();

    $invoices = $pdo->query("SELECT f.id_factura AS id, f.id_venta, f.fecha_emision, f.uso_cfdi, v.total, c.rfc
        FROM FACTURA f
        INNER JOIN VENTA v ON v.id_venta = f.id_venta
        INNER JOIN CLIENTE c ON c.id_cliente = v.id_cliente
        ORDER BY f.id_factura DESC")->fetchAll();

    $logs = $pdo->query("SELECT b.id_bitacora AS id, b.fecha, b.accion, e.nombre AS empleado
        FROM BITACORA b
        INNER JOIN EMPLEADO e ON e.id_empleado = b.id_empleado
        ORDER BY b.fecha DESC, b.id_bitacora DESC
        LIMIT 50")->fetchAll();

    return compact('products', 'inventory', 'clients', 'employees', 'roles', 'branches', 'salesByChannel', 'salesByRegion', 'shipments', 'invoices', 'logs');
}

try {
    ensureCatalogs($pdo);

    switch ($action) {
        case 'login':
            $data = input();
            $stmt = $pdo->prepare("SELECT e.id_empleado, e.nombre, e.correo, e.`contraseña` AS password_hash, e.activo, r.nombre_rol, s.nombre AS sucursal FROM EMPLEADO e INNER JOIN ROL r ON r.id_rol = e.id_rol LEFT JOIN SUCURSAL s ON s.id_sucursal = e.id_sucursal WHERE e.correo = ? LIMIT 1");
            $stmt->execute([strtolower(trim($data['correo'] ?? ''))]);
            $employee = $stmt->fetch();
            if (!$employee || !password_verify((string)($data['password'] ?? ''), $employee['password_hash'])) response(['error' => 'Correo o contraseña incorrectos.'], 401);
            if (!(bool)$employee['activo']) response(['error' => 'El empleado esta inactivo.'], 403);
            logAction($pdo, 'Sesion iniciada: ' . $employee['correo'], (int)$employee['id_empleado']);
            response(['success' => true, 'empleado' => ['id' => (int)$employee['id_empleado'], 'nombre' => $employee['nombre'], 'correo' => $employee['correo'], 'rol' => $employee['nombre_rol'], 'sucursal' => $employee['sucursal'] ?? 'Sin sucursal']]);

        case 'initial_data':
        case 'dashboard_data':
            response(dashboardData($pdo));

        case 'create_product':
            $data = input();
            $name = trim($data['nombre'] ?? '');
            $sku = strtoupper(trim($data['sku'] ?? ''));
            $price = (float)($data['precio'] ?? 0);
            $category = trim($data['categoria'] ?? 'General');
            if ($name === '' || $sku === '' || $price <= 0) response(['error' => 'Datos de producto invalidos.'], 400);
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO PRODUCTO (nombre, sku, costo_base) VALUES (?, ?, ?)');
            $stmt->execute([$name, $sku, round($price * .60, 2)]);
            $id = (int)$pdo->lastInsertId();
            $pdo->prepare('INSERT INTO CATEGORIA_PRODUCTO (id_producto, categoria, fecha_inicio) VALUES (?, ?, CURDATE())')->execute([$id, $category]);
            $prices = $pdo->prepare('INSERT INTO PRECIO_CANAL (id_producto, canal, precio_venta, fecha_vigencia_inicio) VALUES (?, ?, ?, CURDATE())');
            foreach (['Linea' => $price, 'Fisica' => round($price * 1.05, 2), 'Corporativo' => round($price * .90, 2)] as $channel => $channelPrice) $prices->execute([$id, $channel, $channelPrice]);
            foreach ([1, 2, 3] as $branch) $pdo->prepare('INSERT INTO INVENTARIO (id_sucursal, id_producto, cantidad_disponible) VALUES (?, ?, 0)')->execute([$branch, $id]);
            logAction($pdo, 'Producto creado: ' . $sku);
            $pdo->commit();
            response(['success' => true, 'id' => $id]);

        case 'create_client':
            $data = input();
            $type = ($data['tipo'] ?? '') === 'persona_moral' ? 'Corporativo' : 'Individual';
            $stmt = $pdo->prepare('INSERT INTO CLIENTE (tipo_cliente, nombre_razon_social, rfc, correo, telefono) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$type, trim($data['nombre'] ?? ''), strtoupper(trim($data['rfc'] ?? '')), trim($data['correo'] ?? ''), trim($data['telefono'] ?? '')]);
            $clientId = (int)$pdo->lastInsertId();
            if (!empty($data['direccion'])) {
                $pdo->prepare('INSERT INTO DIRECCION_CLIENTE (id_cliente, direccion, ciudad, estado, codigo_postal) VALUES (?, ?, ?, ?, ?)')->execute([$clientId, $data['direccion'], $data['ciudad'] ?? '', $data['estado'] ?? '', $data['cp'] ?? '']);
            }
            logAction($pdo, 'Cliente creado: ' . ($data['nombre'] ?? ''));
            response(['success' => true, 'id' => $clientId]);

        case 'delete_client':
            $id = (int)(input()['id'] ?? 0);
            $hasSales = $pdo->prepare('SELECT COUNT(*) FROM VENTA WHERE id_cliente = ?');
            $hasSales->execute([$id]);
            if ((int)$hasSales->fetchColumn() > 0) response(['error' => 'No se puede eliminar un cliente con ventas registradas.'], 409);
            $pdo->prepare('DELETE FROM DIRECCION_CLIENTE WHERE id_cliente = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM CLIENTE WHERE id_cliente = ?')->execute([$id]);
            logAction($pdo, 'Cliente eliminado: ' . $id);
            response(['success' => true]);

        case 'create_employee':
            $data = input();
            $roleId = (int)($data['rol'] ?? 0) ?: ensureRole($pdo, 'Vendedor');
            ensureEmployee($pdo, trim($data['nombre'] ?? ''), strtolower(trim($data['correo'] ?? '')), (string)($data['password'] ?? 'Empleado123*'), $roleId, (int)($data['sucursal'] ?? 1), 1);
            logAction($pdo, 'Empleado creado: ' . ($data['correo'] ?? ''));
            response(['success' => true]);

        case 'delete_employee':
            $id = (int)(input()['id'] ?? 0);
            $pdo->prepare('UPDATE EMPLEADO SET activo = FALSE WHERE id_empleado = ?')->execute([$id]);
            logAction($pdo, 'Empleado desactivado: ' . $id);
            response(['success' => true]);

        case 'adjust_stock':
            $data = input();
            $branch = (int)($data['sucursal'] ?? 1);
            $sku = strtoupper(trim($data['sku'] ?? ''));
            $qty = (int)($data['cantidad'] ?? 0);
            $stmt = $pdo->prepare('SELECT id_producto FROM PRODUCTO WHERE sku = ?');
            $stmt->execute([$sku]);
            $productId = $stmt->fetchColumn();
            if (!$productId) response(['error' => 'SKU no encontrado.'], 404);
            $pdo->prepare('INSERT INTO INVENTARIO (id_sucursal, id_producto, cantidad_disponible) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad_disponible = GREATEST(cantidad_disponible + VALUES(cantidad_disponible), 0)')->execute([$branch, $productId, $qty]);
            logAction($pdo, 'Inventario ajustado: ' . $sku . ' ' . $qty);
            response(['success' => true]);

        case 'create_sale':
            $data = input();
            $channel = in_array(($data['canal'] ?? 'Fisica'), ['Fisica', 'Linea', 'Corporativo'], true) ? $data['canal'] : 'Fisica';
            $items = $data['items'] ?? [];
            if (!$items) response(['error' => 'La venta no tiene productos.'], 400);
            $pdo->beginTransaction();
            $clientId = getOrCreateClient($pdo, (int)($data['cliente'] ?? 0));
            $subtotal = 0;
            $validated = [];
            foreach ($items as $item) {
                $productId = (int)$item['id'];
                $qty = (int)$item['cantidad'];
                $stock = $pdo->prepare('SELECT cantidad_disponible FROM INVENTARIO WHERE id_sucursal = 1 AND id_producto = ? FOR UPDATE');
                $stock->execute([$productId]);
                if ((int)$stock->fetchColumn() < $qty) throw new RuntimeException('Stock insuficiente.');
                $price = currentPrice($pdo, $productId, $channel);
                $subtotal += $price * $qty;
                $validated[] = [$productId, $qty, $price];
            }
            $stmt = $pdo->prepare("INSERT INTO VENTA (id_cliente, id_empleado, id_sucursal, canal_venta, estado_venta, subtotal, total) VALUES (?, 1, 1, ?, 'Pagada', ?, ?)");
            $stmt->execute([$clientId, $channel, $subtotal, $subtotal]);
            $saleId = (int)$pdo->lastInsertId();
            foreach ($validated as [$productId, $qty, $price]) {
                $pdo->prepare('INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario_historico) VALUES (?, ?, ?, ?)')->execute([$saleId, $productId, $qty, $price]);
                $pdo->prepare('UPDATE INVENTARIO SET cantidad_disponible = cantidad_disponible - ? WHERE id_sucursal = 1 AND id_producto = ?')->execute([$qty, $productId]);
            }
            logAction($pdo, 'Venta registrada en canal ' . $channel . ': #' . $saleId);
            $pdo->commit();
            response(['success' => true, 'venta_id' => $saleId, 'total' => $subtotal]);

        default:
            response(['error' => 'Accion no reconocida.'], 404);
    }
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    response(['success' => false, 'error' => $e->getMessage()], 500);
}
