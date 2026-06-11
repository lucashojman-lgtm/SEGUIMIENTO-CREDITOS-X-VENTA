# Seguimiento de Créditos por Venta — World Salud 2026

Dashboard de facturación y cobranza **2026** que refleja los datos del Google Sheet
[Seguimiento Facturación Clientes 2026](https://docs.google.com/spreadsheets/d/17RdCgz50wF5pSqS0GcAKRv4wblUrIBetP-DyF0tEako/edit).

El dashboard se **genera con fecha en el nombre**, por ejemplo
`DSH_SEGUIMIENTO_CLIENTES_WS_11062026.html`, a partir de la planilla.

## Archivos

| Archivo | Qué es |
|---|---|
| `generar_dashboard.py` | Script que lee la planilla y genera el dashboard con fecha. |
| `plantilla_dashboard.html` | Plantilla del dashboard (diseño + lógica). No editar a mano salvo para cambiar el diseño. |
| `DSH_SEGUIMIENTO_CLIENTES_WS_<fecha>.html` | Dashboard generado para un corte de datos. Es el archivo que se abre/comparte. |

## Cómo generar un dashboard actualizado

1. **Descargar la planilla**: en Google Sheets → `Archivo` → `Descargar` → `Microsoft Excel (.xlsx)`.
2. **Instalar la dependencia** (una sola vez): `pip install openpyxl`
3. **Ejecutar el script**:

   ```bash
   python generar_dashboard.py  Seguimiento_Facturacion.xlsx
   ```

   Genera `DSH_SEGUIMIENTO_CLIENTES_WS_<fecha de hoy>.html`.

   Para fijar otra fecha de corte:

   ```bash
   python generar_dashboard.py  Seguimiento_Facturacion.xlsx  --fecha 08/06/2026
   ```

4. **Abrir** el archivo `DSH_...html` generado en el navegador. Contraseña: la del área de Administración.

> Si la planilla está compartida como *“cualquiera con el enlace”*, podés correr el script
> sin pasar el archivo y lo descarga solo:  `python generar_dashboard.py`

## Qué toma de la planilla

El script lee dos pestañas y todo el tablero se calcula a partir de ahí:

- **`Tableros`** → Facturación emitida (sin IVA), Ingresos/cobranza y Anticuación de deuda.
- **`Factura a cobrar`** → facturas pendientes (vencimiento, estimado a cobrar, %, estado) y proyección de cobro semanal.

Las cifras del dashboard coinciden con los totales de la planilla. Como la planilla es
dinámica (la anticuación y las vencidas cambian con el tiempo), cada corte refleja el
estado a la fecha indicada en el encabezado.

## Pestañas del dashboard

Resumen · Facturación · Cobranza · Pendientes · Anticuación · Clientes.

---

## Carga automática (todos los viernes a las 19 hs)

Para que el dashboard se genere **solo**, sin tu computadora, se usa **Google Apps
Script** (vive dentro de la planilla y corre en los servidores de Google). El código
está en `apps_script/Code.gs`.

**Instalación (una sola vez):**

1. **Subí `plantilla_dashboard.html` a Google Drive.** Hacé clic derecho → `Compartir`
   → `Copiar vínculo` y guardá el **ID** (el texto largo entre `/d/` y `/view`).
2. Abrí la planilla en Google Sheets → menú **`Extensiones` → `Apps Script`**.
3. Borrá lo que haya y **pegá todo el contenido de `apps_script/Code.gs`**.
4. Arriba del código, en `TEMPLATE_FILE_ID`, pegá el ID del paso 1.
   (Opcional: en `OUTPUT_FOLDER_ID` poné el ID de la carpeta donde querés que se
   guarden los dashboards; si lo dejás vacío usa la carpeta de la planilla.)
5. **Configurá la zona horaria**: `Configuración del proyecto` (ícono de engranaje) →
   `Zona horaria` → **(GMT-03:00) Buenos Aires**. Así "las 19 hs" es hora argentina.
6. Guardá (💾) y ejecutá **una vez** la función **`instalarDisparadorSemanal`**
   (botón ▶). Google te va a pedir autorización: aceptá.
7. *(Opcional, para probar)* ejecutá **`generarDashboard`** una vez y verificá que
   aparezca el archivo `DSH_..._<fecha>.html` en tu Drive.

Listo. A partir de ahí, **cada viernes a las 19 hs** se crea automáticamente en Drive
el archivo `DSH_SEGUIMIENTO_CLIENTES_WS_<fecha>.html` con los datos del momento.

> Si cambiás el diseño (`plantilla_dashboard.html`), volvé a subir el archivo a Drive
> reemplazando el anterior (mismo ID) y el automático ya usa la versión nueva.

