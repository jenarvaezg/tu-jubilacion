# Verificación de casos frontera contra SS (2026-03-05)

Ejecución realizada contra:

- `https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001`

Scripts usados:

- `scripts/engine-boundary-report.sh`
- `scripts/ss-run-boundary-official.sh`
- `scripts/compare-boundary-reports.sh`

Casos frontera:

- `scripts/boundary-cases.csv`

## Resultado comparado (motor vs SS)

| id | engine_nominal | ss_nominal | delta_nominal | delta_nominal_pct | ss_pct |
|---|---:|---:|---:|---:|---:|
| B_MIN_ORD | 2172.26 | 2172.40 | -0.14 | -0.01% | 100.0 |
| B_MIN_PLUS | 2172.28 | 2172.42 | -0.14 | -0.01% | 100.0 |
| B_MAX_MINUS | 8022.50 | 8023.04 | -0.54 | -0.01% | 100.0 |
| B_MAX_ORD | 8022.52 | 8023.05 | -0.53 | -0.01% | 100.0 |
| AGE_EARLY_12 | 7471.96 | 7865.73 | -393.77 | -5.01% | 100.0 |
| AGE_EARLY_24 | 6245.91 | 7711.50 | -1465.59 | -19.01% | 100.0 |
| AGE_LATE_12 | 8510.29 | 8183.50 | 326.79 | 3.99% | 100.0 |
| AGE_LATE_24 | 9014.36 | 8347.16 | 667.20 | 7.99% | 100.0 |
| THR_385_BELOW | 6337.79 | 8023.05 | -1685.26 | -21.01% | 100.0 |
| THR_385_AT | 8022.52 | 8023.05 | -0.53 | -0.01% | 100.0 |
| THR_415_BELOW_64 | 7452.29 | 7865.73 | -413.44 | -5.26% | 100.0 |
| THR_415_AT_64 | 7471.96 | 7865.73 | -393.77 | -5.01% | 100.0 |
| THR_445_BELOW_64 | 7471.96 | 7865.73 | -393.77 | -5.01% | 100.0 |
| THR_445_AT_64 | 7491.62 | 7865.73 | -374.11 | -4.76% | 100.0 |

## Lectura rápida

- Ajuste casi exacto en fronteras de base y ordinaria (`B_MIN_*`, `B_MAX_*`, `THR_385_AT`).
- En esta ruta anónima (`ACBR0001`) todos los casos salen con `porcentajeAplicable=100.0`.
- Por eso, casos de anticipada/demorada y umbrales de transición no reflejan penalización/complemento en la salida oficial de este flujo.

## Implicación para Fase 1

- Si la referencia oficial sigue siendo `ProsaInternetAnonimo/ACBR0001`, el motor está alineado para escenarios ordinarios.
- Para validar anticipada/demorada con coeficientes reales hay que contrastar contra el flujo oficial que sí los expone (por ejemplo, el simulador autenticado de "Tu cotización"), no solo contra esta ruta anónima.
