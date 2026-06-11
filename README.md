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
