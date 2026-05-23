# Monster, Inc. Corporation

Este repositorio contiene la conexion centralizada para que la tienda en linea y el ERP trabajen sobre la misma base de datos local: `sistema_ventas`.

## Flujo de trabajo entre sistemas

La tienda `tienda-de-Monsters-Inc` registra operaciones de clientes, ventas en linea, direcciones de envio, facturacion y detalle de productos vendidos.

El ERP `ERP-Monsters-Inc` administra empleados, roles, sucursales, regiones, inventario, promociones, precios por canal y seguimiento operativo.

Ambos sistemas deben usar el mismo archivo `conexion.php` o una copia equivalente que conecte a `sistema_ventas`. De esta forma, una venta realizada desde la tienda queda guardada en las tablas `VENTA` y `DETALLE_VENTA`, mientras que el ERP puede consultar esa misma informacion para facturacion, inventario y seguimiento.

## Orden correcto para ejecutar en XAMPP

1. Abrir el panel de XAMPP.
2. Encender `Apache`.
3. Encender `MySQL`.
4. Abrir phpMyAdmin en `http://localhost/phpmyadmin`.
5. Ejecutar por primera vez cualquier archivo PHP que incluya `conexion.php`.
6. Confirmar que se creo la base `sistema_ventas`.
7. Abrir la tienda y el ERP desde el navegador.

## Rutas locales esperadas

Si los proyectos estan dentro de `htdocs`, las rutas son:

```text
http://localhost/tienda-de-Monsters-Inc/
http://localhost/ERP-Monsters-Inc/
```

Si estan dentro de una carpeta contenedora, por ejemplo `MonsterInc`, las rutas son:

```text
http://localhost/MonsterInc/tienda-de-Monsters-Inc/
http://localhost/MonsterInc/ERP-Monsters-Inc/
```

## Verificacion de base de datos

En phpMyAdmin debe existir la base:

```text
sistema_ventas
```

Y deben aparecer las tablas principales:

```text
REGION
SUCURSAL
ROL
PERMISO
ROL_PERMISO
EMPLEADO
CLIENTE
CUENTA_CLIENTE
DIRECCION_CLIENTE
PRODUCTO
CATEGORIA_PRODUCTO
PRECIO_CANAL
INVENTARIO
PROMOCION
VENTA
DETALLE_VENTA
FACTURA
ESTADO_ENVIO
ENVIO
BITACORA
```

## Verificacion de inventario y canales

Para validar la integracion:

1. Registrar productos en `PRODUCTO`.
2. Registrar precios en `PRECIO_CANAL` usando los canales `Linea`, `Fisica` y `Corporativo`.
3. Registrar existencias por sucursal en `INVENTARIO`.
4. Hacer una venta desde la tienda con canal `Linea`.
5. Confirmar que la venta aparezca en `VENTA`.
6. Confirmar que los productos vendidos aparezcan en `DETALLE_VENTA`.
7. Revisar en el ERP el inventario de la misma sucursal.

La tienda y el ERP no deben crear bases separadas. Todo debe consultar y modificar `sistema_ventas`.
