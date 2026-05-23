# 🏢 Monsters Inc. ERP & Tienda Online — Solución Corporativa e Integración de Ventas

Este proyecto es una plataforma empresarial integrada localmente que consta de dos sistemas conectados a una sola base de datos MySQL llamada `sistema_ventas`:

1.  **🛒 Tienda de Monsters Inc (`tienda-de-Monsters-Inc`)**: Canal de e-commerce donde los clientes finales consultan stock en tiempo real y realizan compras.
2.  **💼 Monsters Inc ERP (`ERP-Monsters-Inc`)**: Consola interna de administración para la gestión de inventarios, procesamiento de ventas (punto de venta físico y corporativo), emisión de CFDI (Facturación Fiscal), corte de caja dinámico, y control de accesos basado en roles (RBAC).

---

## 📈 Resolución de la Problemática del Negocio

De acuerdo con los requerimientos entregados (situación de ventas multicanal e inconsistencia de reportes), la arquitectura de esta solución resuelve cada punto de la siguiente manera:

| Situación a Resolver (Caso de Estudio) | Implementación Técnica y de Base de Datos | Componente del ERP / Tienda |
| :--- | :--- | :--- |
| **Múltiples canales de venta inconexos** | Unificación en la tabla `VENTA` con el atributo `canal_venta` estructurado como `ENUM('Linea', 'Fisica', 'Corporativo')`. | Dashboard consolidado en tiempo real. |
| **Los precios varían por canal** | Tabla relacional `PRECIO_CANAL` que permite fijar montos específicos para cada SKU según el canal de venta y rango de fechas. | Tienda (Canal Linea) y ERP (Punto Físico / Corporativo). |
| **Clientes duplicados o incompletos** | Normalización de datos en 3FN separando `CLIENTE`, `DIRECCION_CLIENTE` y `CUENTA_CLIENTE` con llaves primarias y foráneas únicas. | Módulo de Clientes del ERP. |
| **Los productos cambian de categoría** | Tabla `CATEGORIA_PRODUCTO` con vigencia temporal (`fecha_inicio` y `fecha_fin`) para rastreo analítico e histórico de categorías. | Base de datos e Inventarios. |
| **Información no uniforme por canal** | La tabla `ENVIO` y `ESTADO_ENVIO` solo se asocia a ventas no presenciales (`Linea` y `Corporativo`). Las físicas no requieren envío. | Procesamiento de ventas. |
| **Análisis por períodos de tiempo** | Consultas dinámicas sobre `VENTA` filtrando por fecha (`fecha_venta`). | Corte de caja (Semanal, Mensual, Rango Libre). |
| **Visión consolidada y reportes manuales** | Consultas agregadas con `SUM` y `COUNT` en la base de datos, mostradas en gráficos interactivos actualizables. | Dashboard principal con descarga en CSV. |

---

## 🛠️ Arquitectura de la Base de Datos

La estructura relacional (esquema `MonsterInc.sql`) garantiza la integridad referencial y previene inconsistencias mediante restricciones de llave foránea (`FOREIGN KEY`), triggers y transacciones controladas.

### Tablas Principales del Sistema
*   **Geografía y Estructura**: `REGION` y `SUCURSAL` (representan el alcance geográfico de la empresa).
*   **Gestión de Accesos (RBAC)**: `ROL`, `PERMISO` y `ROL_PERMISO` (control dinámico de visibilidad en interfaz).
*   **Personal**: `EMPLEADO` (autenticación segura con hash `password_hash`).
*   **Clientes**: `CLIENTE`, `CUENTA_CLIENTE` y `DIRECCION_CLIENTE`.
*   **Inventario y Catálogo**: `PRODUCTO`, `CATEGORIA_PRODUCTO`, `PRECIO_CANAL` e `INVENTARIO` (control de stock por sucursal).
*   **Transaccional**: `VENTA` y `DETALLE_VENTA` (guarda `precio_unitario_historico` para no alterar facturas emitidas si cambian los precios del catálogo).
*   **Fiscal y Logística**: `FACTURA` (emisión de CFDI) y `ENVIO` / `ESTADO_ENVIO` (seguimiento de entregas).
*   **Auditoría**: `BITACORA` (registro de operaciones de empleados con rol y canal).

---

## 💎 Características Premium del ERP

La interfaz del ERP ha sido optimizada con un diseño visual moderno, transiciones dinámicas y componentes altamente interactivos:

*   **⚡ Notificaciones Toast**: Eliminación total de los diálogos `alert()` del navegador. Las alertas de validaciones, éxitos y errores se muestran como popups integrados elegantes en la esquina superior derecha.
*   **📉 Dashboard Analítico**: Gráficas de barras auto-ajustables que consolidan las ventas netas por canal y la procedencia de los clientes.
*   **🧾 Autorelleno de Importe de CFDI**: Al emitir un CFDI en el módulo de facturación, el sistema calcula de forma inteligente el monto aproximado de la factura basándose en el historial de consumos del cliente seleccionado para ese canal específico.
*   **🔐 Modificación de Permisos en Caliente**: Desde la pantalla de Accesos, los Administradores pueden cambiar los privilegios de cualquier Rol. Al instante, el menú del sidebar oculta o muestra las opciones permitidas para la simulación de privilegios.
*   **📦 Scrollbar Elegante**: La barra lateral incluye un diseño de scroll minimalista para que todas las opciones (incluyendo *Recargar datos de BD* y *Cerrar Sesión*) estén siempre al alcance sin importar la resolución.

---

## 🔑 Credenciales del ERP (Acceso por Roles)

El sistema cuenta con 5 cuentas de empleados configuradas con distintos privilegios en la base de datos:

| Rol de Empleado | Correo de Acceso | Contraseña | Permisos Iniciales |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@monsters.com` | `Admin123*` | Acceso Total a todos los módulos |
| **Gerente** | `gerente@monsters.com` | `Gerente123*` | Tablero, Ventas, Clientes, Inventarios, Corte |
| **Vendedor** | `vendedor@monsters.com` | `Vendedor123*` | Tablero, Ventas, Clientes |
| **Almacén** | `almacen@monsters.com` | `Almacen123*` | Tablero, Inventarios |
| **Contador** | `contador@monsters.com` | `Contador123*` | Tablero, Facturación, Corte |

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos
*   **XAMPP** u otro servidor local con PHP 8.0+ y MySQL.
*   Apache configurado en el puerto `8080` (si usas el puerto default `80`, recuerda ajustar las URLs).

### Pasos de Ejecución
1.  Descarga o copia este directorio en la carpeta raíz de tu servidor local (ej. `C:/xampp/htdocs/MonsterInc/`).
2.  Abre el Panel de XAMPP e inicia los módulos de **Apache** y **MySQL**.
3.  Ingresa a la Tienda Online:
    ```text
    http://localhost:8080/MonsterInc/tienda-de-Monsters-Inc/
    ```
4.  Ingresa al ERP Corporativo:
    ```text
    http://localhost:8080/MonsterInc/ERP-Monsters-Inc/
    ```
    *La primera vez que abras cualquiera de los dos sistemas, `conexion.php` se encargará de crear la base de datos `sistema_ventas` e importar automáticamente toda la estructura y datos de prueba de `MonsterInc.sql` si aún no existen.*

---

## 🧪 Guía de Pruebas Integradas (Paso a Paso)

Para demostrar que los canales y la base de datos están correctamente integrados y sincronizados, realiza el siguiente flujo de prueba:

### Prueba A: Compra en la Tienda y Sincronización
1.  Entra a la **Tienda Online** (`tienda-de-Monsters-Inc`).
2.  Agrega una *Laptop Lenovo ThinkPad E16* al carrito.
3.  Haz clic en el botón de tu carrito en la esquina superior derecha y presiona **Proceder al pago**.
4.  Registra la compra a nombre de un cliente de prueba.
5.  Abre el **ERP** e inicia sesión como Administrador (`admin@monsters.com`).
6.  Haz clic en el botón **Recargar datos de BD** en el sidebar. Verás que:
    *   Las ventas totales del dashboard aumentaron.
    *   En el módulo de **Inventarios**, el stock del producto disminuyó (el inventario se actualiza dinámicamente).
    *   En el módulo de **Ventas**, se encuentra registrada la nueva venta bajo el canal `Online` (registrado como `Linea` en la BD).

### Prueba B: Emisión de CFDI (Facturación Fiscal)
1.  En el ERP, dirígete al menú **Facturación**.
2.  Selecciona un cliente corporativo (ej. *Tv Azteca S.A*) y selecciona el canal.
3.  El campo **Importe** se autorellenará basándose en el volumen comercial histórico de ese cliente.
4.  Presiona **Emitir CFDI**. Verás aparecer un Toast verde indicando que el CFDI fue emitido. El registro se agrega inmediatamente a la tabla histórica de facturas emitidas a la derecha.

### Prueba C: Restricción de Accesos (Seguridad)
1.  Cierra sesión en el ERP presionando **Cerrar sesión** en la barra lateral.
2.  Inicia sesión ahora como Almacenista (`almacen@monsters.com` / `Almacen123*`).
3.  Observa cómo el menú lateral reduce las opciones disponibles: no podrás ver las ventas corporativas ni gestionar roles de acceso.
4.  Si intentas forzar una acción no autorizada, el sistema desplegará un mensaje de error tipo Toast indicando que no posees el permiso correspondiente.
