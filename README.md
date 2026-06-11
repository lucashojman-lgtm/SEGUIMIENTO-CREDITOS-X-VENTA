# Seguimiento de Créditos por Venta — World Salud 2026

Dashboard de facturación y cobranza **2026** que refleja los datos del Google Sheet
[Seguimiento Facturación Clientes 2026](https://docs.google.com/spreadsheets/d/17RdCgz50wF5pSqS0GcAKRv4wblUrIBetP-DyF0tEako/edit).

## Uso

Abrir `index.html` en el navegador. Contraseña: la del área de Administración.

## Pestañas

- **Resumen** — KPIs (facturado, cobrado, pendiente, vencido), facturación vs cobranza mensual y anticuación.
- **Facturación** — facturación 2026 por mes y por cliente (sin IVA).
- **Cobranza** — ingresos de caja por mes y por cliente, eficiencia de cobranza.
- **Pendientes** — "Factura a cobrar": vencimiento, estimado, %, estado y proyección semanal de cobro.
- **Anticuación** — deuda por bucket (Corriente / 1–30 días) y por cliente.
- **Clientes** — facturado, cobrado, % cobranza y pendiente por cliente.

## Origen de los datos

Los datos están al **08/06/2026** (fecha de reporte del drive) y coinciden con las
pestañas del Sheet: *Facturación emitida*, *Ingresos*, *Anticuación de créditos* y
*Factura a cobrar*.

## Cómo actualizar

Editar en `index.html` (bloque `DATOS 2026`) las constantes:

- `FACT` — facturación sin IVA por cliente `[Ene..Jun]`
- `COBR` — ingresos de caja por cliente `[Ene..Jun]`
- `PENDING` — facturas a cobrar (monto, vencimiento, estimado, %, estado)
- `ANTIC` — anticuación por cliente (Corriente / 1–30 días)
- `PROJ` — proyección de cobro semanal
- `REPORT_DATE` — fecha de corte de los datos

Todas las cifras se calculan a partir de estas constantes, por lo que con
actualizarlas el resto del tablero se recalcula solo.
