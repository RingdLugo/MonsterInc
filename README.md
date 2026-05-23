# Monster, Inc. Corporation

Proyecto local con dos sistemas conectados a una sola base de datos MySQL llamada `sistema_ventas`:

- `tienda-de-Monsters-Inc`: tienda en linea para clientes.
- `ERP-Monsters-Inc`: sistema interno para empleados, productos, ventas e inventario.

La solucion sigue la arquitectura descrita en la propuesta formal: informacion centralizada, tres canales de venta, inventario sincronizado, precios por canal y estructura relacional con integridad referencial.

## Requisitos

- XAMPP con Apache y MySQL activos.
- PHP 8 o superior.
- MySQL en `localhost`, puerto `3306`.
- Usuario MySQL: `root`.
- Contrasena MySQL: vacia, configuracion local por defecto de XAMPP.

En esta computadora Apache esta configurado en el puerto `8080`, por eso las rutas locales usan `http://localhost:8080`.

## Estructura

```text
MonsterInc/
  conexion.php
  tienda-de-Monsters-Inc/
    index.html
    api.php
    conexion.php
    script.js
    estilo.css
    sistema_interno.php
  ERP-Monsters-Inc/
    index.html
    api.php
    conexion.php
    script.js
    styles.css
```

## Base de datos

El archivo principal `conexion.php` se conecta primero a MySQL sin seleccionar base de datos. Si `sistema_ventas` no existe, la crea y ejecuta el esquema completo.

Tablas principales:

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

## Flujo entre tienda y ERP

La tienda consulta productos desde `PRODUCTO`, precios vigentes desde `PRECIO_CANAL` con canal `Linea`, y existencias desde `INVENTARIO`.

Cuando el cliente compra en la tienda:

1. Se valida que el producto exista.
2. Se valida inventario disponible.
3. Se crea o reutiliza el cliente en `CLIENTE`.
4. Se registra la venta en `VENTA` con canal `Linea`.
5. Se registran los productos vendidos en `DETALLE_VENTA`.
6. Se descuenta inventario en `INVENTARIO`.

El ERP consulta la misma base. Al recargar el ERP, ve el inventario actualizado por las ventas de la tienda. Para punto de venta interno, el ERP usa precios del canal `Fisica`. Al registrar productos desde el ERP, se crean precios para `Linea`, `Fisica` y `Corporativo`.

## Problematica cubierta

El sistema atiende las situaciones del caso y del PDF:

- integra informacion de sucursales fisicas, tienda en linea y atencion corporativa;
- evita bases separadas por canal;
- permite comparar ventas por canal y por region;
- administra productos con precio por canal;
- mantiene inventario centralizado por sucursal;
- registra clientes, ventas, facturas, envios, empleados y bitacora;
- conserva historial de categorias en `CATEGORIA_PRODUCTO`;
- permite tomar decisiones con informacion consolidada.

## Funciones del ERP

El ERP ya opera contra `sistema_ventas` en estos modulos:

- punto de venta interno con canal `Fisica`, `Linea` o `Corporativo`;
- graficas de ventas comparativas por canal;
- graficas de desempeno por region;
- gestion de productos;
- gestion de clientes con totales separados por canal;
- inventario por sucursal;
- ajuste de inventario;
- gestion de empleados;
- desactivacion de empleados;
- consulta de roles;
- consulta de envios;
- consulta de facturas;
- bitacora exportable a CSV.

Los nombres visibles de los canales son:

- `Online`: se guarda en la base como `Linea`.
- `Punto Fisico`: se guarda en la base como `Fisica`.
- `Corporaciones`: se guarda en la base como `Corporativo`.

Cada venta descuenta inventario de la sucursal asociada al canal, registra `VENTA` y `DETALLE_VENTA`, genera `FACTURA`, crea `ENVIO` cuando aplica y registra la accion en `BITACORA`. Las graficas se actualizan al recargar los datos desde la base.

Los productos iniciales son articulos comerciales reales de ejemplo:

- Laptop Lenovo ThinkPad E16.
- Monitor Samsung 27 pulgadas FHD.
- Impresora HP LaserJet Pro M404dn.
- Silla ergonomica Herman Miller Sayl.
- Cafetera Nespresso Vertuo Pop.

## Flujo operativo del ERP

La version funcional del ERP modela una operacion comercial integrada para Monster Inc.:

- `Online`: pedidos web asignados al centro de distribucion.
- `Punto Fisico`: venta directa en sucursal.
- `Corporaciones`: contratos B2B para clientes de alto volumen.

Cada operacion mueve el estado completo de la aplicacion:

- descuenta inventario de articulos reales;
- genera venta;
- crea factura/CFDI;
- genera envio cuando el canal lo requiere;
- agrega movimiento en bitacora;
- actualiza graficas, reportes y corte de caja.

La regla operativa es que no haya botones decorativos: cada boton modifica datos, filtra, exporta, genera documentos, cambia estados o actualiza permisos.

## Credenciales del ERP

El ERP valida usuarios contra la tabla `EMPLEADO`. Las contrasenas se guardan hasheadas con `password_hash`.

Al abrir el ERP se muestra la pantalla de inicio de sesion. Despues de entrar, el dashboard queda asociado al rol del empleado y aparece el boton `Cerrar sesion` para salir y permitir que otro usuario entre con sus propios privilegios.

Usuarios disponibles:

```text
admin@monsters.com
Admin123*
```

```text
gerente@monsters.com
Gerente123*
```

```text
vendedor@monsters.com
Vendedor123*
```

```text
almacen@monsters.com
Almacen123*
```

```text
contador@monsters.com
Contador123*
```

## Rutas locales

Tienda:

```text
http://localhost:8080/MonsterInc/tienda-de-Monsters-Inc/
```

ERP:

```text
http://localhost:8080/MonsterInc/ERP-Monsters-Inc/
```

phpMyAdmin:

```text
http://localhost:8080/phpmyadmin
```

Si phpMyAdmin esta configurado por HTTPS en tu XAMPP, tambien puede abrir como:

```text
https://localhost/phpmyadmin
```

## Como ejecutar

1. Abrir XAMPP.
2. Encender `Apache`.
3. Encender `MySQL`.
4. Abrir `http://localhost:8080/MonsterInc/tienda-de-Monsters-Inc/`.
5. Abrir `http://localhost:8080/MonsterInc/ERP-Monsters-Inc/`.
6. Entrar al ERP con alguna de las credenciales anteriores.
7. Verificar en phpMyAdmin que exista la base `sistema_ventas`.

## Como probar que funciona

1. Abrir la tienda.
2. Agregar un producto al carrito.
3. Abrir `MI CARRITO`.
4. Cambiar cantidades con `+` o `-`.
5. Eliminar un producto con `x`.
6. Presionar `Proceder al pago`.
7. Capturar nombre, correo y metodo de pago.
8. Confirmar la compra.
9. Abrir el ERP.
10. Revisar que el inventario del producto vendido haya bajado.
11. Revisar en phpMyAdmin las tablas `VENTA`, `DETALLE_VENTA` e `INVENTARIO`.

