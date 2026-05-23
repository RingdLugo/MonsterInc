<?php
declare(strict_types=1);

/**
 * Conexion centralizada a la base de datos sistema_ventas.
 *
 * Uso:
 * $pdo = require_once __DIR__ . '/conexion.php';
 */

$host = 'localhost';
$port = 3306;
$dbName = 'sistema_ventas';
$username = 'root';
$password = '';
$charset = 'utf8mb4';

$serverDsn = "mysql:host={$host};port={$port};charset={$charset}";
$databaseDsn = "mysql:host={$host};port={$port};dbname={$dbName};charset={$charset}";

$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

if (defined('PDO::MYSQL_ATTR_MULTI_STATEMENTS')) {
    $pdoOptions[PDO::MYSQL_ATTR_MULTI_STATEMENTS] = true;
}

$schemaSql = <<<'SQL'
CREATE DATABASE IF NOT EXISTS sistema_ventas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_ventas;

CREATE TABLE REGION (
    id_region INT AUTO_INCREMENT PRIMARY KEY,
    nombre_region VARCHAR(100) NOT NULL
);

CREATE TABLE SUCURSAL (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_region INT NOT NULL,
    direccion VARCHAR(255),
    es_centro_distribucion BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_region) REFERENCES REGION(id_region)
);

CREATE TABLE ROL (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL
);

CREATE TABLE PERMISO (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL
);

CREATE TABLE ROL_PERMISO (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES ROL(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES PERMISO(id_permiso)
);

CREATE TABLE EMPLEADO (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_sucursal INT NULL,
    id_region INT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES ROL(id_rol),
    FOREIGN KEY (id_sucursal) REFERENCES SUCURSAL(id_sucursal),
    FOREIGN KEY (id_region) REFERENCES REGION(id_region)
);

CREATE TABLE CLIENTE (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_cliente ENUM('Individual','Corporativo') NOT NULL,
    nombre_razon_social VARCHAR(150) NOT NULL,
    rfc VARCHAR(20),
    correo VARCHAR(100),
    telefono VARCHAR(20)
);

CREATE TABLE CUENTA_CLIENTE (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNIQUE NOT NULL,
    correo_login VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente)
);

CREATE TABLE DIRECCION_CLIENTE (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente)
);

CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    costo_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE CATEGORIA_PRODUCTO (
    id_categoria_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE PRECIO_CANAL (
    id_precio INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    canal ENUM('Fisica','Linea','Corporativo') NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    fecha_vigencia_inicio DATE NOT NULL,
    fecha_vigencia_fin DATE NULL,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE INVENTARIO (
    id_sucursal INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_sucursal, id_producto),
    FOREIGN KEY (id_sucursal) REFERENCES SUCURSAL(id_sucursal),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE PROMOCION (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_promocion VARCHAR(150) NOT NULL,
    porcentaje_descuento DECIMAL(5,2) NOT NULL,
    canal_aplica ENUM('Linea','Sucursal','Corporativo','Todos') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

CREATE TABLE VENTA (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_empleado INT NULL,
    id_sucursal INT NOT NULL,
    canal_venta ENUM('Fisica','Linea','Corporativo') NOT NULL,
    estado_venta ENUM('Pendiente','Pagada','Cancelada') NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado),
    FOREIGN KEY (id_sucursal) REFERENCES SUCURSAL(id_sucursal)
);

CREATE TABLE DETALLE_VENTA (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    id_promocion INT NULL,
    cantidad INT NOT NULL,
    precio_unitario_historico DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
    FOREIGN KEY (id_promocion) REFERENCES PROMOCION(id_promocion)
);

CREATE TABLE FACTURA (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT UNIQUE NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    uso_cfdi VARCHAR(50),
    sello_digital VARCHAR(255),
    FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta)
);

CREATE TABLE ESTADO_ENVIO (
    id_estado_envio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE ENVIO (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT UNIQUE NOT NULL,
    id_direccion INT NOT NULL,
    id_estado_envio INT NOT NULL,
    fecha_estimada_entrega DATE,
    numero_guia VARCHAR(100),
    FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta),
    FOREIGN KEY (id_direccion) REFERENCES DIRECCION_CLIENTE(id_direccion),
    FOREIGN KEY (id_estado_envio) REFERENCES ESTADO_ENVIO(id_estado_envio)
);

CREATE TABLE BITACORA (
    id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    accion VARCHAR(255) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);
SQL;

try {
    $serverConnection = new PDO($serverDsn, $username, $password, $pdoOptions);

    $databaseExists = $serverConnection->prepare(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :database_name'
    );
    $databaseExists->execute(['database_name' => $dbName]);

    if ($databaseExists->fetchColumn() === false) {
        $serverConnection->exec($schemaSql);
    }

    $pdo = new PDO($databaseDsn, $username, $password, $pdoOptions);
    $pdo->exec("SET NAMES {$charset} COLLATE utf8mb4_unicode_ci");

    return $pdo;
} catch (PDOException $exception) {
    throw new RuntimeException(
        'No fue posible conectar o preparar la base de datos sistema_ventas.',
        0,
        $exception
    );
}
