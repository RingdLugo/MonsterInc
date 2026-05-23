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

function ensureCatalogs(PDO $pdo): void
{
    $pdo->exec("INSERT IGNORE INTO REGION (id_region, nombre_region) VALUES (1, 'Centro')");
    $pdo->exec("
        INSERT IGNORE INTO SUCURSAL (id_sucursal, nombre, id_region, direccion, es_centro_distribucion)
        VALUES (1, 'Sucursal Online', 1, 'Plataforma en linea Monster Inc.', TRUE)
    ");

    ensureEmployees($pdo);

    $products = [
        ['Puerta estandar de sustos', 'PRD-001', 900.00, 'Puertas', 1500.00, 20],
        ['Puerta premium peluda', 'PRD-002', 1800.00, 'Puertas', 3200.00, 12],
        ['Contenedor de gritos', 'PRD-003', 650.00, 'Energia', 1100.00, 30],
        ['Kit de seguridad CDA', 'PRD-004', 450.00, 'Seguridad', 850.00, 25],
        ['Monitor de energia de risas', 'PRD-005', 1200.00, 'Energia', 2100.00, 15],
    ];

    $findProductStmt = $pdo->prepare('SELECT id_producto FROM PRODUCTO WHERE sku = ? LIMIT 1');
    $productStmt = $pdo->prepare('INSERT INTO PRODUCTO (nombre, sku, costo_base) VALUES (?, ?, ?)');
    $categoryStmt = $pdo->prepare('INSERT INTO CATEGORIA_PRODUCTO (id_producto, categoria, fecha_inicio) VALUES (?, ?, CURDATE())');
    $priceStmt = $pdo->prepare('INSERT INTO PRECIO_CANAL (id_producto, canal, precio_venta, fecha_vigencia_inicio) VALUES (?, ?, ?, CURDATE())');
    $priceExistsStmt = $pdo->prepare('SELECT COUNT(*) FROM PRECIO_CANAL WHERE id_producto = ? AND canal = ? AND fecha_vigencia_fin IS NULL');
    $categoryExistsStmt = $pdo->prepare('SELECT COUNT(*) FROM CATEGORIA_PRODUCTO WHERE id_producto = ? AND fecha_fin IS NULL');
    $stockStmt = $pdo->prepare('INSERT INTO INVENTARIO (id_sucursal, id_producto, cantidad_disponible) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE cantidad_disponible = cantidad_disponible');

    foreach ($products as [$name, $sku, $cost, $category, $linePrice, $stock]) {
        $findProductStmt->execute([$sku]);
        $productId = $findProductStmt->fetchColumn();

        if ($productId === false) {
            $productStmt->execute([$name, $sku, $cost]);
            $productId = (int)$pdo->lastInsertId();
        } else {
            $productId = (int)$productId;
        }

        $categoryExistsStmt->execute([$productId]);
        if ((int)$categoryExistsStmt->fetchColumn() === 0) {
            $categoryStmt->execute([$productId, $category]);
        }

        foreach (['Linea' => $linePrice, 'Fisica' => round($linePrice * 1.05, 2), 'Corporativo' => round($linePrice * 0.90, 2)] as $channel => $price) {
            $priceExistsStmt->execute([$productId, $channel]);
            if ((int)$priceExistsStmt->fetchColumn() === 0) {
                $priceStmt->execute([$productId, $channel, $price]);
            }
        }

        $stockStmt->execute([$productId, $stock]);
    }
}

function ensureRole(PDO $pdo, string $roleName): int
{
    $stmt = $pdo->prepare('SELECT id_rol FROM ROL WHERE nombre_rol = ? LIMIT 1');
    $stmt->execute([$roleName]);
    $roleId = $stmt->fetchColumn();

    if ($roleId !== false) {
        return (int)$roleId;
    }

    $stmt = $pdo->prepare('INSERT INTO ROL (nombre_rol) VALUES (?)');
    $stmt->execute([$roleName]);

    return (int)$pdo->lastInsertId();
}

function ensureEmployee(PDO $pdo, string $name, string $email, string $plainPassword, int $roleId, ?int $branchId, ?int $regionId): void
{
    $stmt = $pdo->prepare('SELECT id_empleado FROM EMPLEADO WHERE correo = ? LIMIT 1');
    $stmt->execute([$email]);

    if ($stmt->fetchColumn() !== false) {
        return;
    }

    $passwordHash = password_hash($plainPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO EMPLEADO (nombre, correo, `contraseña`, id_rol, id_sucursal, id_region, activo)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
    ");
    $stmt->execute([$name, $email, $passwordHash, $roleId, $branchId, $regionId]);
}

function ensureEmployees(PDO $pdo): void
{
    $adminRoleId = ensureRole($pdo, 'Administrador');
    $managerRoleId = ensureRole($pdo, 'Gerente de sucursal');
    $sellerRoleId = ensureRole($pdo, 'Vendedor');

    ensureEmployee($pdo, 'Admin General', 'admin@monsters.com', 'Admin123*', $adminRoleId, 1, 1);
    ensureEmployee($pdo, 'Celia Mae', 'gerente@monsters.com', 'Gerente123*', $managerRoleId, 1, 1);
    ensureEmployee($pdo, 'Mike Wazowski', 'vendedor@monsters.com', 'Vendedor123*', $sellerRoleId, 1, null);
}

function currentPrice(PDO $pdo, int $productId, string $channel): float
{
    $stmt = $pdo->prepare("
        SELECT precio_venta
        FROM PRECIO_CANAL
        WHERE id_producto = ?
          AND canal = ?
          AND fecha_vigencia_inicio <= CURDATE()
          AND (fecha_vigencia_fin IS NULL OR fecha_vigencia_fin >= CURDATE())
        ORDER BY fecha_vigencia_inicio DESC, id_precio DESC
        LIMIT 1
    ");
    $stmt->execute([$productId, $channel]);
    $price = $stmt->fetchColumn();

    if ($price === false) {
        throw new RuntimeException('No hay precio vigente para el canal seleccionado.');
    }

    return (float)$price;
}

function clientId(PDO $pdo): int
{
    $stmt = $pdo->query("SELECT id_cliente FROM CLIENTE ORDER BY id_cliente ASC LIMIT 1");
    $id = $stmt->fetchColumn();

    if ($id !== false) {
        return (int)$id;
    }

    $stmt = $pdo->prepare("
        INSERT INTO CLIENTE (tipo_cliente, nombre_razon_social, rfc, correo, telefono)
        VALUES ('Individual', 'Cliente mostrador', NULL, 'mostrador@monsters.com', NULL)
    ");
    $stmt->execute();

    return (int)$pdo->lastInsertId();
}

try {
    ensureCatalogs($pdo);

    switch ($action) {
        case 'login':
            if ($requestMethod !== 'POST') {
                response(['error' => 'Metodo no permitido.'], 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $email = strtolower(trim($input['correo'] ?? ''));
            $password = (string)($input['password'] ?? '');

            if ($email === '' || $password === '') {
                response(['error' => 'Correo y contraseña son requeridos.'], 400);
            }

            $stmt = $pdo->prepare("
                SELECT
                    e.id_empleado,
                    e.nombre,
                    e.correo,
                    e.`contraseña` AS password_hash,
                    e.activo,
                    r.nombre_rol,
                    s.nombre AS sucursal
                FROM EMPLEADO e
                INNER JOIN ROL r ON r.id_rol = e.id_rol
                LEFT JOIN SUCURSAL s ON s.id_sucursal = e.id_sucursal
                WHERE e.correo = ?
                LIMIT 1
            ");
            $stmt->execute([$email]);
            $employee = $stmt->fetch();

            if (!$employee || !password_verify($password, $employee['password_hash'])) {
                response(['error' => 'Correo o contraseña incorrectos.'], 401);
            }

            if (!(bool)$employee['activo']) {
                response(['error' => 'El empleado esta inactivo.'], 403);
            }

            response([
                'success' => true,
                'empleado' => [
                    'id' => (int)$employee['id_empleado'],
                    'nombre' => $employee['nombre'],
                    'correo' => $employee['correo'],
                    'rol' => $employee['nombre_rol'],
                    'sucursal' => $employee['sucursal'] ?? 'Sin sucursal asignada',
                ],
            ]);

        case 'initial_data':
            $products = $pdo->query("
                SELECT
                    p.id_producto AS id,
                    p.nombre,
                    p.sku,
                    COALESCE(pc.precio_venta, p.costo_base) AS precio,
                    COALESCE(cp.categoria, 'General') AS categoria,
                    COALESCE(i.cantidad_disponible, 0) AS stock
                FROM PRODUCTO p
                LEFT JOIN PRECIO_CANAL pc
                    ON pc.id_producto = p.id_producto
                    AND pc.canal = 'Fisica'
                    AND pc.fecha_vigencia_inicio <= CURDATE()
                    AND (pc.fecha_vigencia_fin IS NULL OR pc.fecha_vigencia_fin >= CURDATE())
                LEFT JOIN CATEGORIA_PRODUCTO cp
                    ON cp.id_producto = p.id_producto AND cp.fecha_fin IS NULL
                LEFT JOIN INVENTARIO i
                    ON i.id_producto = p.id_producto AND i.id_sucursal = 1
                ORDER BY p.id_producto ASC
            ")->fetchAll();

            $clients = $pdo->query("
                SELECT
                    nombre_razon_social AS nombre,
                    rfc,
                    tipo_cliente AS tipo,
                    correo,
                    telefono
                FROM CLIENTE
                ORDER BY id_cliente ASC
            ")->fetchAll();

            response([
                'productos' => array_map(static fn(array $item): array => [
                    'id' => (int)$item['id'],
                    'nombre' => $item['nombre'],
                    'sku' => $item['sku'],
                    'precio' => (float)$item['precio'],
                    'categoria' => $item['categoria'],
                    'stock' => (int)$item['stock'],
                ], $products),
                'clientes' => $clients,
            ]);

        case 'create_product':
            if ($requestMethod !== 'POST') {
                response(['error' => 'Metodo no permitido.'], 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $name = trim($input['nombre'] ?? '');
            $sku = strtoupper(trim($input['sku'] ?? ''));
            $price = (float)($input['precio'] ?? 0);
            $category = trim($input['categoria'] ?? 'General');

            if ($name === '' || $sku === '' || $price <= 0) {
                response(['error' => 'Datos de producto invalidos.'], 400);
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare('INSERT INTO PRODUCTO (nombre, sku, costo_base) VALUES (?, ?, ?)');
            $stmt->execute([$name, $sku, round($price * 0.60, 2)]);
            $productId = (int)$pdo->lastInsertId();

            $pdo->prepare('INSERT INTO CATEGORIA_PRODUCTO (id_producto, categoria, fecha_inicio) VALUES (?, ?, CURDATE())')
                ->execute([$productId, $category]);

            $priceStmt = $pdo->prepare('INSERT INTO PRECIO_CANAL (id_producto, canal, precio_venta, fecha_vigencia_inicio) VALUES (?, ?, ?, CURDATE())');
            $priceStmt->execute([$productId, 'Linea', $price]);
            $priceStmt->execute([$productId, 'Fisica', round($price * 1.05, 2)]);
            $priceStmt->execute([$productId, 'Corporativo', round($price * 0.90, 2)]);

            $pdo->prepare('INSERT INTO INVENTARIO (id_sucursal, id_producto, cantidad_disponible) VALUES (1, ?, 0)')
                ->execute([$productId]);

            $pdo->commit();
            response(['success' => true, 'id' => $productId]);

        case 'create_sale':
            if ($requestMethod !== 'POST') {
                response(['error' => 'Metodo no permitido.'], 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $channel = $input['canal'] ?? 'Fisica';
            $validChannels = ['Fisica', 'Linea', 'Corporativo'];
            $channel = in_array($channel, $validChannels, true) ? $channel : 'Fisica';
            $items = $input['items'] ?? [];

            if (!is_array($items) || empty($items)) {
                response(['error' => 'La venta no tiene productos.'], 400);
            }

            $pdo->beginTransaction();
            $clientId = clientId($pdo);
            $subtotal = 0.0;
            $validated = [];

            foreach ($items as $item) {
                $productId = (int)($item['id'] ?? 0);
                $quantity = (int)($item['cantidad'] ?? 0);

                $stmt = $pdo->prepare("
                    SELECT p.nombre, i.cantidad_disponible
                    FROM PRODUCTO p
                    INNER JOIN INVENTARIO i
                        ON i.id_producto = p.id_producto AND i.id_sucursal = 1
                    WHERE p.id_producto = ?
                    FOR UPDATE
                ");
                $stmt->execute([$productId]);
                $product = $stmt->fetch();

                if (!$product || $quantity <= 0) {
                    throw new RuntimeException('Producto invalido en la venta.');
                }

                if ((int)$product['cantidad_disponible'] < $quantity) {
                    throw new RuntimeException("Stock insuficiente para {$product['nombre']}.");
                }

                $price = currentPrice($pdo, $productId, $channel);
                $subtotal += $price * $quantity;
                $validated[] = [$productId, $quantity, $price];
            }

            $stmt = $pdo->prepare("
                INSERT INTO VENTA (id_cliente, id_empleado, id_sucursal, canal_venta, estado_venta, subtotal, total)
                VALUES (?, NULL, 1, ?, 'Pagada', ?, ?)
            ");
            $stmt->execute([$clientId, $channel, $subtotal, $subtotal]);
            $saleId = (int)$pdo->lastInsertId();

            $detailStmt = $pdo->prepare("
                INSERT INTO DETALLE_VENTA (id_venta, id_producto, id_promocion, cantidad, precio_unitario_historico)
                VALUES (?, ?, NULL, ?, ?)
            ");
            $stockStmt = $pdo->prepare('UPDATE INVENTARIO SET cantidad_disponible = cantidad_disponible - ? WHERE id_sucursal = 1 AND id_producto = ?');

            foreach ($validated as [$productId, $quantity, $price]) {
                $detailStmt->execute([$saleId, $productId, $quantity, $price]);
                $stockStmt->execute([$quantity, $productId]);
            }

            $pdo->commit();
            response(['success' => true, 'venta_id' => $saleId, 'total' => $subtotal]);

        default:
            response(['error' => 'Accion no reconocida.'], 404);
    }
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    response(['success' => false, 'error' => $exception->getMessage()], 500);
}
